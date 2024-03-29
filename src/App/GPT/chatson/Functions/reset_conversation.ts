//== react, react-router-dom, Auth0 ==//

//== TSX Components ==//

//== NPM Components ==//

//== Icons ==//

//== NPM Functions ==//

//== Utility Functions ==//
import { nodeArrayReset } from './../nodeArray';

//== Environment Variables, TypeScript Interfaces, Data Objects ==//
import { IChatContext } from '../../../../Context/ChatContext';
import { NavigateFunction } from 'react-router-dom';

export function reset_conversation(
  CC: IChatContext,
  navigate: NavigateFunction
): void {
  //-- If SSE abortable, abort --//
  if (CC.completionStreaming) {
    CC.abortControllerRef.current?.abort();
  }
  //-- Clear nodeArray and ChatContext values --//
  nodeArrayReset();
  CC.setRowArray([]);
  CC.setConversation(null);
  CC.setConversationId(null);
  CC.setTemperature(null);
  CC.setFocusTextarea(true);
  navigate('/gpt');
  CC.triggerReset(); // Toggle the reset signal
}
