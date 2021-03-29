import { ExtensionState } from 'extension/models/message';
import { Observable } from 'rxjs';

declare global {
  interface Window {
    subscribeExtensionState: () => Observable<ExtensionState>;
  }
}
