import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-use';

import { defaultOrFirst } from '../utils/query';

export default function Experiments() {
  const router = useRouter();

  const [experiments, setExperiments] = useLocalStorage('experiments', '');
  const value = defaultOrFirst(router.query.value);

  useEffect(() => {
    if (value === undefined || router === undefined) {
      return;
    }

    if (experiments === value) {
      router.replace('/');
    } else {
      setExperiments(value);
      router.reload();
    }
  }, [value, router, experiments, setExperiments]);

  return <div>Experiments</div>;
}
