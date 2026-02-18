
import { User, LearningState, Lesson } from "../types";

// Constants for the SRS algorithm
const MIN_STRENGTH = 0.1;
const MAX_STRENGTH = 1.0;
const INITIAL_INTERVAL_DAYS = 1;

// Difficulty multipliers: harder lessons need more frequent reviews.
const DIFFICULTY_MULTIPLIERS = {
    'Beginner': 1.0,
    'Intermediate': 0.85,
    'Advanced': 0.7,
};

class SpacedRepetitionService {
    
    /**
     * Get a list of lesson IDs that are due for review for a given user.
     */
    getDueForReview(user: User): string[] {
        const dueLessonIds: string[] = [];
        const now = new Date();

        for (const lessonId in user.learningState) {
            const state = user.learningState[lessonId];
            const dueDate = new Date(state.nextReviewDue);
            if (dueDate <= now) {
                dueLessonIds.push(lessonId);
            }
        }
        return dueLessonIds;
    }
    
    /**
     * Update a user's learning state for a specific lesson after a review.
     * This is the core of the SRS logic.
     */
    updateLearningState(
        currentState: LearningState | undefined,
        performance: number, // A score from 0.0 to 1.0
        difficulty: Lesson['difficulty']
    ): LearningState {
        const now = new Date().toISOString();

        if (!currentState) {
            // First time seeing this lesson
            const nextReviewDue = new Date(Date.now() + INITIAL_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
            return {
                strength: 0.2, // Start with low strength
                lastReviewed: now,
                nextReviewDue,
                reviewHistory: [{ timestamp: now, performance }],
            };
        }

        // --- Ebbinghaus Forgetting Curve & Multivariate Model Simulation ---
        
        // 1. Calculate the new memory strength based on performance
        // Strength is a long-term measure of memory consolidation.
        let newStrength = currentState.strength + (performance - 0.5) * 0.2;
        
        // 2. Determine the next interval
        const lastInterval = Math.max(1, (new Date(currentState.nextReviewDue).getTime() - new Date(currentState.lastReviewed).getTime()) / (1000 * 60 * 60 * 24));
        const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
        let newIntervalDays;

        if (performance < 0.6) {
            // LAPSE: The user failed the review.
            // Interval is reduced significantly, forcing an earlier review.
            // Strength is also penalized slightly more to reflect the lapse.
            newIntervalDays = Math.max(1, lastInterval * 0.5 * difficultyMultiplier);
            newStrength -= 0.1; // Extra penalty for lapse
        } else {
            // SUCCESS: The user passed the review.
            // The interval growth is based on the last interval, the current memory strength,
            // how well they performed, and the item's intrinsic difficulty.
            // A higher strength and better performance lead to faster interval growth.
            const growthFactor = 1.2 + (newStrength * 1.5) * (performance - 0.5);
            newIntervalDays = lastInterval * growthFactor * difficultyMultiplier;
        }

        // 3. Clamp strength and cap the interval to reasonable bounds.
        newStrength = Math.max(MIN_STRENGTH, Math.min(MAX_STRENGTH, newStrength));
        newIntervalDays = Math.min(newIntervalDays, 180); // Max 6 months

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(newIntervalDays));

        return {
            strength: newStrength,
            lastReviewed: now,
            nextReviewDue: nextReviewDate.toISOString(),
            reviewHistory: [...currentState.reviewHistory, { timestamp: now, performance }],
        };
    }
}

export const srsService = new SpacedRepetitionService();