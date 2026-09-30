// The httpOnly session cookie can only be cleared by a successful server response.
export async function logoutSession(
  request: () => Promise<unknown>,
  onSuccess: () => void,
  onFailure: (error: unknown) => void,
): Promise<void> {
  try {
    await request();
  } catch (error) {
    onFailure(error);
    return;
  }
  onSuccess();
}
