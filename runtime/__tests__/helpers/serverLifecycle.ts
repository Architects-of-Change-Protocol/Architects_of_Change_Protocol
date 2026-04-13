import type { Server } from 'http';

export async function startServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('error', onError);
      reject(error);
    };

    server.once('error', onError);
    server.listen(0, () => {
      server.off('error', onError);
      resolve();
    });
  });
}

export async function closeServer(server: Server): Promise<void> {
  if (!server.listening) {
    server.removeAllListeners('error');
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      server.removeAllListeners('error');
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
