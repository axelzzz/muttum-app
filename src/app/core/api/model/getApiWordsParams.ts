
export type GetApiWordsParams = {
/**
 * @minimum 1
 */
page?: number;
/**
 * @minimum 1
 * @maximum 100
 */
limit?: number;
/**
 * Filter by word text
 */
search?: string;
/**
 * Only return words marked as favorite
 */
favorite?: boolean;
};
