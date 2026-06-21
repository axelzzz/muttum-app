
export type PostApiAuthRegisterBody = {
  email: string;
  /**
     * @minLength 2
     * @maxLength 50
     */
  username: string;
  /**
     * @minLength 6
     * @maxLength 128
     */
  password: string;
};
