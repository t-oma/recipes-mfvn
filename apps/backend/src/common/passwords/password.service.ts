/**
 * Password service interface.
 *
 * Password service is responsible for hashing and verifying passwords.
 */
export interface PasswordService {
  /**
   * Hashes a password.
   *
   * @param password - The password to hash.
   * @returns The hashed password.
   */
  hash(password: string): Promise<string>;
  /**
   * Verifies a password.
   *
   * @param password - The password to verify.
   * @param hash - The hashed password.
   * @returns True if the password is correct, false otherwise.
   */
  verify(password: string, hash: string): Promise<boolean>;
}
