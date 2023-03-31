import NextLink, { LinkProps } from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';

export default function Link(props: LinkProps & MuiLinkProps) {
  const { className, ...other } = props;

  return (
    <MuiLink
      component={NextLink}
      className={className}
      {...other}
      underline="hover"
    />
  );
}
