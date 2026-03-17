import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import * as TabsComponents from 'fumadocs-ui/components/tabs';
import * as StepsComponents from 'fumadocs-ui/components/steps';
import { FileCodeIcon, FilesIcon, TerminalIcon } from 'lucide-react';
import { BsJavascript, BsTypescript, BsCss } from "react-icons/bs";
import { Tabs as CodeTabs, TabsContent as CodeTabsContent } from './ui/tabs';
import { createGenerator, createFileSystemGeneratorCache } from 'fumadocs-typescript';
import { AutoTypeTable, type AutoTypeTableProps } from 'fumadocs-typescript/ui';
import { TS, JS } from "@/components/lang-selector";

const generator = createGenerator({
  // set a cache, necessary for serverless platform like Vercel
  cache: createFileSystemGeneratorCache('.next/fumadocs-typescript'),
});

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...StepsComponents,
    BsJavascript, BsTypescript, BsCss,
    TS,
    JS,
    FilesIcon,
    TerminalIcon,
    FileCodeIcon,
    CodeTabsContent,
    CodeTabs,
    AutoTypeTable: (props: Partial<AutoTypeTableProps>) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;