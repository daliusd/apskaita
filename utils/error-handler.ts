import StackTrace from 'stacktrace-js';

let user = '';

export function setUser(userName: string) {
  user = userName;
}

async function reportError(
  error: Error,
  event: ErrorEvent | PromiseRejectionEvent,
) {
  let stringifiedStack = '';

  if (error !== null) {
    try {
      const stackframes = await StackTrace.fromError(error);

      stringifiedStack = stackframes.map((sf) => sf.toString()).join('\n');
    } catch {}
  }

  if (!error?.message && !(stringifiedStack || error?.stack)) {
    return;
  }

  let content = '';
  try {
    content = JSON.stringify(event, Object.getOwnPropertyNames(event), 2);
  } catch {}

  try {
    content +=
      '\n\n' + JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
  } catch {}

  try {
    content += '\n\n' + window.location.href;
    content += '\n' + JSON.stringify(Intl.DateTimeFormat().resolvedOptions());
  } catch {}

  try {
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
          content,
        },
      }),
    });
  } catch {} // we can't do anything here. If network is down it is down.
}

export function init() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function (event: ErrorEvent) {
      reportError(event.error, event);
    });

    window.addEventListener(
      'unhandledrejection',
      function (event: PromiseRejectionEvent) {
        reportError(event.reason, event);
      },
    );
  }
}
