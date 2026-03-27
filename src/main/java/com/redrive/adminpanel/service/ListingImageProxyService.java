package com.redrive.adminpanel.service;

import com.redrive.adminpanel.exception.ResourceNotFoundException;
import com.redrive.adminpanel.repository.CarImageRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;

@Service
public class ListingImageProxyService {

    private static final Pattern META_IMAGE_PROPERTY_FIRST = Pattern.compile(
            "<meta[^>]+(?:property|name)=[\"'](?:og:image(?::secure_url)?|twitter:image|twitter:image:src)[\"'][^>]+content=[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern META_IMAGE_CONTENT_FIRST = Pattern.compile(
            "<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+(?:property|name)=[\"'](?:og:image(?::secure_url)?|twitter:image|twitter:image:src)[\"']",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern FIRST_IMAGE_SRC = Pattern.compile(
            "<img[^>]+src=[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    private final CarImageRepository carImageRepository;
    private final HttpClient httpClient;

    public ListingImageProxyService(CarImageRepository carImageRepository) {
        this.carImageRepository = carImageRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public ImagePayload loadListingImage(Long carId) {
        String storedUrl = carImageRepository.findPrimaryImageUrlByCarId(carId)
                .filter(value -> !value.isBlank())
                .orElseThrow(() -> new ResourceNotFoundException("No primary image is stored for this listing."));

        try {
            return fetchImagePayload(storedUrl, 0);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(BAD_GATEWAY, "Listing image could not be loaded.", exception);
        } catch (IOException exception) {
            throw new ResponseStatusException(BAD_GATEWAY, "Listing image could not be loaded.", exception);
        }
    }

    private ImagePayload fetchImagePayload(String sourceUrl, int depth) throws IOException, InterruptedException {
        if (depth > 1) {
            throw new ResponseStatusException(BAD_GATEWAY, "Listing image could not be resolved.");
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(sourceUrl))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "Mozilla/5.0 ReDriveAdminPanel/1.0")
                .header("Accept", "image/avif,image/webp,image/apng,image/*,*/*;q=0.8,text/html;q=0.7")
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        String contentTypeHeader = response.headers()
                .firstValue("Content-Type")
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        String normalizedContentType = contentTypeHeader.toLowerCase();

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ResponseStatusException(BAD_GATEWAY, "Listing image source responded with an error.");
        }

        if (normalizedContentType.startsWith("image/")) {
            return new ImagePayload(response.body(), contentTypeHeader);
        }

        if (!normalizedContentType.contains(MediaType.TEXT_HTML_VALUE)) {
            throw new ResponseStatusException(BAD_GATEWAY, "Listing image source did not return image content.");
        }

        String html = new String(response.body(), StandardCharsets.UTF_8);
        URI baseUri = request.uri();
        String nestedImageUrl = extractImageUrlFromHtml(html)
                .map(candidate -> resolveUrl(baseUri, candidate))
                .orElseThrow(() -> new ResponseStatusException(BAD_GATEWAY, "Listing image could not be discovered from the source page."));

        return fetchImagePayload(nestedImageUrl, depth + 1);
    }

    static Optional<String> extractImageUrlFromHtml(String html) {
        List<Pattern> patterns = List.of(
                META_IMAGE_PROPERTY_FIRST,
                META_IMAGE_CONTENT_FIRST,
                FIRST_IMAGE_SRC
        );

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(html);
            if (matcher.find()) {
                String candidate = matcher.group(1);
                if (candidate != null && !candidate.isBlank()) {
                    return Optional.of(candidate.trim());
                }
            }
        }

        return Optional.empty();
    }

    private String resolveUrl(URI baseUri, String candidate) {
        try {
            return baseUri.resolve(new URI(candidate)).toString();
        } catch (URISyntaxException exception) {
            return baseUri.resolve(candidate).toString();
        }
    }

    public record ImagePayload(byte[] bytes, String contentType) {
    }
}
