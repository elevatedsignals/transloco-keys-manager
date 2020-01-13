import { getConfig, TranslocoConfig } from '@ngneat/transloco-utils';
import { updateScopesMap } from './updateScopesMap';
import { Config } from '../types';
import { defaultConfig } from '../defaultConfig';
import { getScopes } from '../keysBuilder/scopes';
import {resolveProjectPath} from "./resolveProjectPath";
import * as path from 'path';

export function resolveConfig(inlineConfig: Config): Config {
  const defaults = defaultConfig;
  let project;
  if (inlineConfig.project) {
    project = resolveProjectPath(inlineConfig.project);
  }
  const fileConfig = getConfig(inlineConfig.config || project?.root);

  const config = { ...defaults, ...flatFileConfig(fileConfig), ...inlineConfig };

  if (project) {
    const {sourceRoot} = project;
    /* Search for the config within the matching project */
    config.translationsPath = path.resolve(sourceRoot, config.translationsPath);
    config.input = path.resolve(sourceRoot, config.input);
    config.output = path.resolve(sourceRoot, config.output);
  }

  updateScopesMap({ input: config.input });
  return { ...config, scopes: getScopes() };
}

function flatFileConfig(fileConfig: TranslocoConfig) {
  const keysManager = fileConfig.keysManager || {};
  const { rootTranslationsPath, langs } = fileConfig;

  if (rootTranslationsPath) {
    keysManager['translationsPath'] = fileConfig.rootTranslationsPath;
  }

  if (langs) {
    keysManager['langs'] = fileConfig.langs;
  }

  return keysManager;
}
