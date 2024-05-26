import NextLink, { LinkProps } from 'next/link';
import { Anchor, type AnchorProps } from '@mantine/core';

export default function Link(
  props: LinkProps & AnchorProps & { children: React.ReactNode; target?: any },
) {
  const { target, ...other } = props;

  return (
    <Anchor target={target} component={NextLink} underline="hover" {...other} />
  );
}
