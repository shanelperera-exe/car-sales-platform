package com.redrive.adminpanel.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ListingImageProxyServiceTest {

    @Test
    void extractImageUrlFromHtmlPrefersOpenGraphMeta() {
        String html = """
                <html>
                  <head>
                    <meta property="og:image" content="https://cdn.example.com/car.jpg" />
                  </head>
                  <body></body>
                </html>
                """;

        String imageUrl = ListingImageProxyService.extractImageUrlFromHtml(html).orElseThrow();

        assertEquals("https://cdn.example.com/car.jpg", imageUrl);
    }

    @Test
    void extractImageUrlFromHtmlFallsBackToFirstImageTag() {
        String html = """
                <html>
                  <body>
                    <img src="/images/listing-hero.jpeg" alt="Car" />
                  </body>
                </html>
                """;

        String imageUrl = ListingImageProxyService.extractImageUrlFromHtml(html).orElseThrow();

        assertEquals("/images/listing-hero.jpeg", imageUrl);
    }

    @Test
    void extractImageUrlFromHtmlReturnsEmptyWhenNothingMatches() {
        String html = "<html><body><p>No image metadata</p></body></html>";

        assertTrue(ListingImageProxyService.extractImageUrlFromHtml(html).isEmpty());
    }
}
