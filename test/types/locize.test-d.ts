/* eslint-disable semi */
// eslint-disable-next-line import/no-unresolved
import { expectType } from 'tsd';
// eslint-disable-next-line import/no-unresolved
import {
  turnOn,
  turnOff,
  locizePlugin,
  LocizePlugin,
  setEditorLng,
  showLocizeLink,
  addLocizeSavedHandler
} from '../../index';

expectType<void>(turnOn());
expectType<void>(turnOff());
expectType<LocizePlugin>(locizePlugin);
expectType<void>(setEditorLng('en'));
expectType<void>(showLocizeLink());
expectType<void>(showLocizeLink({ projectId: 'asdf', version: 'asdf' }));
expectType<void>(addLocizeSavedHandler((data) => {}));
