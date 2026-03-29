import { getAsyncLifecycle, getSyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';

const options = {
  featureName: 'procedures-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// Backend dependencies
export const backendDependencies = {};

// Root component
export const root = getAsyncLifecycle(() => import('./root.component'), options);

// Extensions

// Modals

// Workspaces

