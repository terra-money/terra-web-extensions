import { Observable } from 'rxjs';
import { ExtensionState, isTerraConnectMessage, MessageType } from './models/message';

/*
 TODO
 - 필요한 정보들
   - network
   - wallets <{ name = 'anchor-dev2', address: HumanAddr }>
 
 - 작업 순서
   - popup, options 에서 network, wallet 관련 설정을 바꿀때마다 webapp 으로 message 전달
  
 - messages
   - transaction
     - success - tx result
     - fail
     - deny
     - timeout
   - popup
     - open
     - close
 */

async function init() {
  // ---------------------------------------------
  // read connection info
  // ---------------------------------------------
  const meta = document.querySelector('head > meta[name="terra-connect"]');
  const connectId = meta?.getAttribute('content');

  if (!connectId) {
    throw new Error(`cannot find head > meta[name="terra-connect"]`);
  }

  window.subscribeExtensionState = () =>
    new Observable<ExtensionState>((subscriber) => {
      window.addEventListener('message', (event) => {
        if (
          !isTerraConnectMessage(event.data) ||
          event.data.type !== MessageType.EXTENSION_STATE_UPDATED
        ) {
          return;
        }

        subscriber.next(event.data.payload);
        console.log('inpage.tsx..() get message from content!', event.data);
      });
    });

  //@ts-ignore
  //window.fuck = () => {
  //  window.postMessage({
  //    connectId,
  //    payload: {
  //      hello: 'world?',
  //    },
  //  } as TerraConnectMessage);
  //};
}

init();
