//== react, react-router-dom, Auth0 ==//
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';
import { ErrorBoundary } from 'react-error-boundary';

//== Context ==//
import { useChatContext } from '../../Context/ChatContext';
import { useLessonPlanCreation } from '../../Context/LessonPlanCreationContext';

//== TSX Components and Functions ==//
import { send_message } from './chatson/Functions/send_message';
import { get_conversation_and_messages } from './chatson/Functions/get_conversation_and_messages';
import { countTokens } from './chatson/Util/countTokens';
import ChatRowArea from './ChatRowArea';
import { ChatRowAreaFallback } from './ChatRowAreaFallback';
import LessonPlanner from '../../components/LessonPlanner';

//== NPM Components ==//
import { VirtuosoHandle } from 'react-virtuoso';

//== Icons ==//
import { ArrowPathIcon, StopIcon } from '@heroicons/react/24/outline';

//== NPM Functions ==//
// import numeral from 'numeral';
import { toast } from 'react-toastify';
import clsx from 'clsx';

//== Utility Functions ==//
// import classNames from "../../Util/classNames"; // replaced with clsx
import { useIsMobile, useOSName } from '../../Util/useUserAgent';

//== Environment Variables, TypeScript Interfaces, Data Objects ==//
import '../../components/ProgressBar.css';
import { ErrorForToast, ErrorForChatToast } from '../../Errors/ErrorClasses';
import { AxiosError } from 'axios';
import { axiosErrorToaster } from '../../Errors/axiosErrorToaster';
import { ObjectId } from 'bson';
import { DARK_THEME_BG, LIGHT_THEME_BG } from '../../Layout/Theme';
import CompletionDisplay from './CompletionDisplay';
import FirstGPTRequest from '../../components/FirstGPTRequest';

//== ***** ***** ***** Exported Component ***** ***** ***** ==//
export default function ChatSession() {
  //== React State (+ Context, Refs) ==//
  let CC = useChatContext();
  const { isLessonPlanCreated } = useLessonPlanCreation();
  let navigate = useNavigate();
  const { accessToken, resetCounter } = CC; //--- KYLE: dummy access token --//

  //-- Prompt Stuff --//
  const [disableSubmitPrompt, setDisableSubmitPrompt] = useState<boolean>(true);
  const [promptDraft, setPromptDraft] = useState<string>('');
  const [promptTooLong, setPromptTooLong] = useState<boolean>(false);
  const [prompt2XTooLong, setPrompt2XTooLong] = useState<boolean>(false);
  const [approxTokenCount, setApproxTokenCount] = useState<number>(0);
  const [promptContent, setPromptContent] = useState<string>('');
  const [promptReadyToSend, setPromptReadyToSend] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showError, setShowError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  let errorTimeoutRef = useRef<number | null>(null);

  //-- Virtualized rows stuff --//
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const [atBottom, setAtBottom] = useState<boolean>(true);
  const [showButton, setShowButton] = useState<boolean>(false);

  //-- Start: KYLE - Monjo --//
  const [completionContent, setCompletionContent] = useState('');
  const handleCompletionContent = (content: string) => {
    setCompletionContent((prevContent) => prevContent + content); //-- KYLE - new (Monjo) --//
  };
  // const handleCompletionContent = (content: string) => {
  //   setCompletionContent((prevContent) => {
  //     // Prevent duplicate content append
  //     if (prevContent.includes(content)) {
  //       return prevContent;
  //     }
  //     return prevContent + content;
  //   });
  // };

  const [showCompletion, setShowCompletion] = useState(false); //-- Used for on-click of arrow to send message --//
  // const [showLessonPlanner, setShowLessonPlanner] = useState(false); //-- Used to render lesson planner before `Create lesson plan` is clicked --//
  //-- END: Kyle - Monjo --//

  //== Auth ==//
  // const { getAccessTokenSilently, user } = useAuth0();

  //== Other ==//
  const OS_NAME = useOSName();

  //-- ***** ***** ***** ***** start of chatson ***** ***** ***** ***** --//
  //-- When conversation_id is updated (via param or CC.setConversationId), load that conversation --//
  let { entity_type, conversation_id } = useParams();
  useEffect(() => {
    //-- If SSE abortable, abort --//
    if (CC.completionStreaming) {
      if (CC.abortControllerRef.current) {
        CC.abortControllerRef.current.abort();
      }
    }

    const lambda = async () => {
      if (
        entity_type === 'c' &&
        conversation_id &&
        ObjectId.isValid(conversation_id)
      ) {
        CC.setConversationId(conversation_id);
        // const accessToken = await getAccessTokenSilently(); //-- TODO: Replace. See line below. --//
        // TODO -- need a way to generate one access token per site visit. Maybe it get's generated on page load? then that same token can be used throughout this file.
        try {
          await get_conversation_and_messages(accessToken, conversation_id, CC);
        } catch (err) {
          if (err instanceof AxiosError) {
            axiosErrorToaster(err, 'Get Conversation');
          } else if (err instanceof Error) {
            toast(err.message);
          }
        }
      }
    };
    lambda();
  }, [conversation_id]);

  useEffect(() => {
    console.log('Updated rowArray: ', CC.rowArray);
  }, [CC.rowArray]);

  //-- send_message() --//
  // const submitPromptHandler = () => {
  //   //-- Update state and trigger prompt submission to occur afterwards as a side effect --//
  //   setPromptContent(promptDraft);
  //   CC.setCompletionRequested(true);
  //   setPromptReadyToSend(true); //-- Invokes useEffect() below --//
  // };

  //-- KYLE: Modify submitPromptHandler to accept custom content
  const submitPromptHandler = (customContent = promptDraft) => {
    setPromptContent(customContent);
    CC.setCompletionRequested(true);
    setShowCompletion(true); // To show the CompletionDisplay
    setPromptReadyToSend(true); //-- Invokes useEffect() below --//
  };

  //-- KYLE -- Using Lesson Planner as prompt --//
  const handleLessonPlanSubmission = (lessonPlanContent: string) => {
    // Assuming you have a function to handle message submission
    submitPromptHandler(lessonPlanContent);
  };

  useEffect(() => {
    if (promptReadyToSend) {
      //-- Refocus textarea after submitting a prompt (unless on mobile) --//
      let mobile = useIsMobile();
      if (textareaRef.current && !mobile) {
        textareaRef.current.focus();
      }

      //-- If first message, parentNodeId is null --//
      let parentNodeId: string | null = null;
      //-- Else parentNodeId is current leaf node's id --//
      if (CC.rowArray && CC.rowArray.length > 0) {
        parentNodeId = CC.rowArray[CC.rowArray.length - 1].node_id;
      }

      const submitPrompt = async () => {
        // const accessToken = await getAccessTokenSilently();
        console.log('promptContent: ', promptContent); //-- Kyle debugging --//
        console.log('accessToken: ', accessToken); //-- Kyle debugging --//
        console.log('parentNodeId: ', parentNodeId); //-- Kyle debugging --//
        console.log('CC: ', CC); //-- Kyle debugging --//
        //-- Send prompt as chat message --//
        // if (user?.sub) { //-- Kyle commented this out~ --//
        try {
          await send_message(
            accessToken,
            promptContent,
            parentNodeId,
            CC,
            handleCompletionContent, //--KYLE --//
            setPromptDraft,
            navigate
          );
          console.log('message sent'); //-- Kyle debugging --//
        } catch (err) {
          if (err instanceof ErrorForChatToast) {
            chatToast(err.message);
          } else if (err instanceof ErrorForToast) {
            toast(err.message);
          } else if (err instanceof Error) {
            toast(err.message);
          }
        }
        // }
      };
      submitPrompt();

      setPromptReadyToSend(false);
    }
  }, [
    promptReadyToSend,
    accessToken,
    promptContent,
    CC,
    navigate,
    setPromptDraft,
    handleCompletionContent,
  ]);

  useEffect(() => {
    // Reset internal state logic here
    setCompletionContent('');
    // TODO -- reset lessonplan -- think I need to use LessonPlanCreationContext
  }, [resetCounter]);

  //-- Submit edited prompt, create new branch --//
  const regenerateResponse = async () => {
    // const accessToken = await getAccessTokenSilently(); //--KYLE - might need to generate dummy Access token or use prev one --//
    if (CC.rowArray) {
      let last_prompt_row = [...CC.rowArray]
        .reverse()
        .find((row) => row.prompt_or_completion === 'prompt');

      if (last_prompt_row) {
        //-- Send prompt as chat message --//
        CC.setCompletionRequested(true);
        try {
          await send_message(
            accessToken,
            last_prompt_row.content,
            last_prompt_row.parent_node_id,
            CC
          );
        } catch (err) {
          if (err instanceof ErrorForChatToast) {
            chatToast(err.message);
          } else if (err instanceof ErrorForToast) {
            toast(err.message);
          } else if (err instanceof Error) {
            toast(err.message);
          }
        }
      }
    }
  };
  //-- ***** ***** ***** ***** end of chatson ***** ***** ***** ***** --//

  //-- Chat Toast --//
  const chatToast = (message: string) => {
    //-- Show error --//
    setShowError(message);
    //-- Clear old timeout --//
    if (errorTimeoutRef.current !== null) {
      clearTimeout(errorTimeoutRef.current);
    }
    //-- Set new timeout --//
    errorTimeoutRef.current = window.setTimeout(() => {
      // Use window.setTimeout for clarity and type assertion
      setShowError(null);
    }, 4000) as unknown as number; // Explicitly cast the return type to `number`
    //-- Cause error alert progress bar animation to restart --//
    setAnimationKey((prevKey) => prevKey + 1);
  };

  //== Side Effects ==//
  //-- On promptDraft updates, update promptTooLong and disableSubmitPrompt  --//
  useEffect(() => {
    let tokens = countTokens(promptDraft);

    if (!promptDraft || tokens > CC.modelTokenLimit * 2) {
      setDisableSubmitPrompt(true);
    } else {
      setDisableSubmitPrompt(false);
    }

    if (tokens > CC.modelTokenLimit) {
      setPromptTooLong(true);
    } else {
      if (promptTooLong) {
        setPromptTooLong(false);
      }
    }

    if (tokens > CC.modelTokenLimit * 2) {
      setPrompt2XTooLong(true);
    } else {
      if (prompt2XTooLong) {
        setPrompt2XTooLong(false);
      }
    }

    setApproxTokenCount(tokens);
  }, [promptDraft]);

  //-- Listener for keyboard shortcuts --//
  useEffect(() => {
    document.addEventListener('keydown', globalKeyDownHandler);
    return () => {
      document.removeEventListener('keydown', globalKeyDownHandler);
    };
  }, []);

  //-- Virtuoso - when 'atBottom' changes - if at bottom don't show button, else show button --//
  useEffect(() => {
    if (atBottom) {
      setShowButton(false);
    } else {
      setShowButton(true);
    }
  }, [atBottom, setShowButton]);

  //== Event Handlers ==//
  //-- 'Enter' to submit prompt, 'Shift + Enter' for newline --//
  const keyDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); //-- Prevent default behavior (newline insertion) --//
      //-- prevent submit while loading or if `disableSubmitPrompt` is true --//
      if (!CC.completionRequested && !disableSubmitPrompt) {
        submitPromptHandler();
      }
    } //-- else "Enter" with shift will just insert a newline --//
  };

  //-- Keyboard shortcut to focus prompt input textarea --//
  const globalKeyDownHandler = (event: KeyboardEvent) => {
    //-- Focus prompt input textarea (`metakey` = ⌘ on MacOS) --//
    if (OS_NAME === 'Mac OS') {
      if (event.metaKey && event.key === '/') {
        event.preventDefault();
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    }
  };

  //-- Text area placeholder handlers and string --//
  const textareaPlaceholder = () => {
    let placeholder = 'Input prompt...';
    // TODO - find way to implement without onBlur
    // if (!textareaFocused && OS_NAME === "Mac OS") {
    //   placeholder = "⌘ +  /  to input prompt...";
    // }
    return placeholder;
  };

  //-- Focus textarea from another component (e.g. via "New Conversation") --//
  useEffect(() => {
    if (CC.focusTextarea) {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
    CC.setFocusTextarea(false); //-- a bit janky. causes an extra render. --//
  }, [CC.focusTextarea]);

  //-- Virtuoso --//
  const scrollToBottomHandler = () => {
    if (virtuosoRef.current && CC.rowArray && CC.rowArray.length > 0) {
      virtuosoRef.current.scrollToIndex({
        index: CC.rowArray.length - 1, // e.g. visibleThread.length
        behavior: 'smooth',
        align: 'end',
      });
    }
  };

  //-- ***** ***** ***** Component Return ***** ***** ***** --//
  return (
    <div id='chat-session-tld' className='flex max-h-full min-h-full flex-col'>
      {/* CURRENT CHAT, SAMPLE PROPMTS, OR FALLBACK */}
      <ErrorBoundary FallbackComponent={ChatRowAreaFallback}>
        <ChatRowArea
          virtuosoRef={virtuosoRef}
          setAtBottom={setAtBottom}
          chatToast={chatToast}
        />
      </ErrorBoundary>

      {/* Conditionally render once 'Create lesson plan' has been clicked */}
      {/* STICKY INPUT SECTION */}
      {/* Conditionally render LessonPlanner */}
      {!isLessonPlanCreated && (
        <LessonPlanner onLessonPlanSubmit={handleLessonPlanSubmission} />
      )}

      {/* Conditionally render the accordian with prompt that was submitted once 'Create lesson plan' has been clicked */}
      {isLessonPlanCreated && <FirstGPTRequest />}

      <div className='p-4'>
        {completionContent && <CompletionDisplay content={completionContent} />}
      </div>

      <div
        className={clsx(
          `${LIGHT_THEME_BG} ${DARK_THEME_BG}`,
          'sticky bottom-0 flex h-auto flex-col justify-center pb-3 pt-1'
        )}
      >
        {/* ABOVE DIVIDER */}

        {/* DIVIDER */}
        <div className='flex justify-center'>
          <div className='mb-2 w-full max-w-prose rounded-full border-t-2 border-zinc-300 dark:border-zinc-600' />
        </div>

        {/* CONTROL BAR */}
        <div className='flex flex-row justify-center'>
          <div
            id='chat-session-control-bar'
            className='flex w-full max-w-prose flex-row'
          >
            <div
              id='control-bar-RHS'
              className='mr-2 flex w-0 flex-shrink-0 flex-grow flex-row items-center justify-end gap-3'
            >
              {/* Regnerate and Stop Generation Buttons */}
              <div className='flex flex-row justify-center'>
                {/* Stop Response Generation */}
                {/* DEV - always 'false' for now, when streaming in use, add logic here to allow user to stop response generation */}
                {CC.completionStreaming && (
                  <>
                    <button
                      onClick={() => {
                        if (CC.abortControllerRef.current) {
                          CC.abortControllerRef.current.abort();
                        }
                      }}
                      className='flex flex-row rounded-md border-2 border-zinc-600 px-2.5 py-1 text-sm font-semibold text-zinc-600 shadow-sm hover:border-zinc-400 hover:bg-zinc-400 hover:text-zinc-50 hover:shadow-md dark:border-zinc-300 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-600'
                    >
                      {/* NOTE - Managing space here on small screens */}
                      <StopIcon className='h-5 w-5 lg:mr-2' />
                      <p className='hidden lg:flex'>Stop</p>
                    </button>
                  </>
                )}
                {!CC.completionRequested &&
                  CC.rowArray &&
                  CC.rowArray.length > 0 && (
                    <button
                      onClick={() => {
                        regenerateResponse(); //-- KYLE -- need to implement this to work! --//
                      }}
                      className='flex flex-row rounded-md border-2 border-zinc-600 px-2.5 py-1 text-sm font-semibold text-zinc-600 shadow-sm hover:border-zinc-400 hover:bg-zinc-400 hover:text-zinc-50 hover:shadow-md dark:border-zinc-300 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-600'
                    >
                      {/* NOTE - Managing space here on small screens */}
                      <ArrowPathIcon className='h-5 w-5 lg:mr-2' />
                      <p className='hidden lg:flex'>Regenerate</p>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* PROMPT INPUT */}
        <div>
          <div className='mb-0.5 lg:mb-1'>
            {/* Large screens and up */}
            <p className='flex-row justify-center text-center font-sans text-xs italic text-zinc-500 dark:text-zinc-400 lg:flex'>
              Due to the&nbsp;
              <span className='inline-block'>
                <a
                  className='underline'
                  href='https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/'
                  target='_blank'
                >
                  nature of LLMs
                </a>
              </span>
              , monjoAI may produce false information.&nbsp;
              {/* <br /> */}
              Use with human discretion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
