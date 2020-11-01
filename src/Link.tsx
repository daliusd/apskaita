/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import NextLink, { LinkProps } from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';

const NextComposedWithRef = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const { href, prefetch, as, ...other } = props;
    return (
      <NextLink href={href} prefetch={prefetch} as={as}>
        <a {...other} ref={ref} />
      </NextLink>
    );
  },
);

export default function Link(props: LinkProps & MuiLinkProps) {
  const { className, ...other } = props;

  return (
    <MuiLink component={NextComposedWithRef} className={className} {...other} />
  );
}
