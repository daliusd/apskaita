import StackTrace from 'stacktrace-js';

let user = '';

export function setUser(userName: string) {
  user = userName;
}

async function reportError(error: Error) {
  let stringifiedStack = '';

  if (error !== null) {
    try {
      const stackframes = await StackTrace.fromError(error);

      stringifiedStack = stackframes.map((sf) => sf.toString()).join('\n');
    } catch {}
  }

  fetch('/api/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: `haiku.lt client side (${user})`,
      error: {
        message: error?.message || 'There is no error message.',
        stack: stringifiedStack || error?.stack || 'There is no error stack.',
      },
    }),
  });
}

export function init() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function (event: ErrorEvent) {
      reportError(event.error);
    });

    window.addEventListener(
      'unhandledrejection',
      function (event: PromiseRejectionEvent) {
        reportError(event.reason);
      },
    );
  }
}
