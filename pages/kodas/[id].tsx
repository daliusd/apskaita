import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-use';

export default function Kodas() {
  const router = useRouter();

  const [code, setCode] = useLocalStorage('code', '', { raw: true });
  const value = router.query.id;

  useEffect(() => {
    if (value === undefined || router === undefined) {
      return;
    }

    if (code === value) {
      router.replace('/');
    } else {
      setCode(value as string);
      router.reload();
    }
  }, [value, router, code, setCode]);

  return null;
}
