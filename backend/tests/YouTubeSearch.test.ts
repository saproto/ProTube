import { describe, it } from '@jest/globals';
import * as YouTubeSearchService from '#Services/YouTubeSearchService.js';
import c from '#Config.js';

describe('YouTubeSearch test', () => {
    describe('testing the format views', () => {
        expect(YouTubeSearchService.formatViews(0)).toBe('0');
        expect(YouTubeSearchService.formatViews(1010014)).toBe('1.0M');
        expect(YouTubeSearchService.formatViews(13421)).toBe('13.4k');
        expect(YouTubeSearchService.formatViews(1089)).toBe('1.1k');
        expect(YouTubeSearchService.formatViews(1045)).toBe('1.0k');
        expect(YouTubeSearchService.formatViews(100)).toBe('100');
        expect(YouTubeSearchService.formatViews(1740303044)).toBe('1.7B');
    });

    describe('testing the search function for duration limits', () => {
        it('should not be able to return videos longer than the defined limit', async () => {
            const search = await YouTubeSearchService.search('1 hour minecraft music');

            for (const video of search.videos.results) {
                expect(video.duration_s).toBeLessThanOrEqual(600);
                expect(video.duration_s).toBeGreaterThanOrEqual(1);
            }
        });

        it('should be able to return videos longer than the defined limit for admins', async () => {
            const search = await YouTubeSearchService.search('1 hour minecraft music', -1);

            expect(search.videos.results.length).toBeGreaterThan(0);

            for (const video of search.videos.results) {
                expect(video.duration_s).toBeGreaterThanOrEqual(c.general.max_video_duration);
            }

            // We also want to see a continuation token
            expect(search.videos.continuationToken).not.toBeNull();
        });
    });

    it('should be able to return playlists', async () => {
        const search = await YouTubeSearchService.search('1 hour minecraft music playlist');

        expect(search.playlists.results.length).toBeGreaterThan(0);

        // We also want to see a continuation token
        expect(search.playlists.continuationToken).not.toBeNull();
    });

    describe('testing the continuation token', () => {
        it('should be able to return the next page of results', async () => {
            const search = await YouTubeSearchService.search('k3');

            expect(search.playlists.results.length).toBeGreaterThan(0);
            expect(search.playlists.continuationToken).not.toBeNull();

            expect(search.videos.results.length).toBeGreaterThan(0);
            expect(search.videos.continuationToken).not.toBeNull();

            const searchContinued = await YouTubeSearchService.searchNextPage(search.playlists.continuationToken, search.videos.continuationToken);

            expect(searchContinued.playlists.results.length).toBeGreaterThan(0);
            expect(searchContinued.videos.results.length).toBeGreaterThan(0);
        });

        it('should return no results for an empty continuation token', async () => {
            const search = await YouTubeSearchService.searchNextPage(null, null);

            expect(search.playlists.results.length).toBe(0);
            expect(search.playlists.continuationToken).toBeNull();

            expect(search.videos.results.length).toBe(0);
            expect(search.videos.continuationToken).toBeNull();
        });
    });
});
