import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const gitConfig = {
  user: 'abdxdev',
  repo: 'abdxdev-cn',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'abdxdev/cn',
    },
    links: [
      {
        text: 'Introduction',
        url: '/docs',
      },
      {
        text: 'Components',
        url: '/docs/components/reveal-highlight',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
