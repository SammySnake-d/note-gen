import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css';
import './chat.scss';

type ThemeType = 'light' | 'dark' | 'system';

export default function ChatPreview({ text }: { text: string }) {
  useEffect(() => {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('html', xml);
    hljs.registerLanguage('css', css);
  }, []);

  const { theme } = useTheme();
  const [mdTheme, setMdTheme] = useState<ThemeType>('light');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const md = useRef<MarkdownIt | null>(null);

  useEffect(() => {
    md.current = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return (
              '<pre class="hljs"><code>' +
              hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
              '</code></pre>'
            );
          } catch (__) {}
        }
        return (
          '<pre class="hljs"><code>' +
          (md.current ? md.current.utils.escapeHtml(str) : str) +
          '</code></pre>'
        );
      },
    });

    md.current.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
      return self.renderToken(tokens, idx, options);
    };

    if (text) {
      setHtmlContent(md.current.render(text));
    }
  }, [text]);

  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setMdTheme(systemTheme);
    } else {
      setMdTheme(theme as ThemeType);
    }
  }, [theme]);

  const getThemeClass = () => {
    return mdTheme === 'dark' ? 'markdown-body markdown-dark' : 'markdown-body';
  };

  return (
    <div
      className={getThemeClass()}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
