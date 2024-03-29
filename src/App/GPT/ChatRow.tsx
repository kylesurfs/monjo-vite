//== react, react-router-dom, Auth0 ==//
import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../../Context/ChatContext';
import { useAuth0 } from '@auth0/auth0-react';

//== TSX Components and Functions ==//
import { change_branch } from './chatson/Functions/change_branch';
import { send_message } from './chatson/Functions/send_message';
import { countTokens } from './chatson/Util/countTokens';

//== NPM Components ==//
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';

//== Icons ==//
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import {
  ClipboardDocumentIcon,
  CpuChipIcon,
  PencilSquareIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

//== NPM Functions ==//
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'react-toastify';

//== Utility Functions ==//
import clsx from 'clsx';
import getFriendly from './chatson/Util/getFriendly';

//== Environment Variables, TypeScript Interfaces, Data Objects ==//
import { IMessageRow } from './chatson/chatson_types';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Tooltip from '../../components/Tooltip';
import { ErrorForToast, ErrorForChatToast } from '../../Errors/ErrorClasses';

//-- Exported Component --//
interface IProps {
  row: IMessageRow;
  prevRow: IMessageRow | null;
  chatToast: Function;
}
export default function ChatRow({ row, prevRow, chatToast }: IProps) {
  //-- Context, State, Auth, Error Boundary, Custom Hooks --//
  let CC = useChatContext();
  const { accessToken } = CC; //--- KYLE: dummy access token --//
  // const { getAccessTokenSilently, user } = useAuth0(); // REPLACED with above line by KYLE
  const [clipboardValue, copyToClipboard] = useCopyToClipboard();
  const user = 'k1k1';

  //-- chatson.change_branch() --//
  const changeBranchHandler = (increment: number) => {
    const node_index = row.sibling_node_ids.indexOf(row.node_id);
    const new_leaf_node_id = row.sibling_node_ids[node_index + increment];
    change_branch(new_leaf_node_id, CC);
  };

  //-- Prompt Stuff --//
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaOnFocusToggle, setTextareaOnFocusToggle] =
    useState<boolean>(false);
  const [disableSubmitPrompt, setDisableSubmitPrompt] = useState<boolean>(true);
  const [promptContent, setPromptContent] = useState<string>(row.content);
  const [promptTooLong, setPromptTooLong] = useState<boolean>(false);
  const [prompt2XTooLong, setPrompt2XTooLong] = useState<boolean>(false);
  const [approxTokenCount, setApproxTokenCount] = useState<number>(0);
  const [editing, setEditing] = useState<boolean>(false);

  //-- On promptDraft updates, update promptTooLong and disableSubmitPrompt  --//
  useEffect(() => {
    let tokens = countTokens(promptContent);

    if (!promptContent || tokens > CC.modelTokenLimit * 2) {
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
  }, [promptContent]);

  //-- Regenerate Completion Function --//
  const regenerateCompletion = async () => {
    // const accessToken = await getAccessTokenSilently(); // REPLACE

    if (prevRow) {
      try {
        //-- Send prompt as chat message --//
        await send_message(
          accessToken,
          prevRow.content,
          prevRow.parent_node_id,
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
  };
  //-- Regnerate Completion Button --//
  const RegenerateButton = () => {
    return (
      <Tooltip
        content='Regenerate'
        placement='top'
        hidden={CC.completionRequested}
      >
        <div
          className={clsx(
            CC.completionRequested ? 'cursor-not-allowed' : '',
            'flex flex-row justify-center rounded-full p-1 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
          )}
        >
          <button
            disabled={CC.completionRequested}
            onClick={regenerateCompletion}
            className={clsx(CC.completionRequested ? 'cursor-not-allowed' : '')}
          >
            <ArrowPathIcon className='h-5 w-5' />
          </button>
        </div>
      </Tooltip>
    );
  };

  //-- Edit Prompt --//
  const EditButton = () => {
    return (
      <Tooltip content='Edit' placement='top' hidden={CC.completionRequested}>
        <div
          className={clsx(
            CC.completionRequested ? 'cursor-not-allowed' : '',
            'flex flex-row justify-center rounded-full p-1 text-zinc-600 dark:text-zinc-300',
            editing
              ? 'bg-green-300 text-green-900 dark:bg-green-800 dark:text-green-200'
              : 'dark:hover:bg-text-200 hover:bg-zinc-300 hover:text-zinc-600 dark:hover:bg-zinc-700'
          )}
        >
          <button
            disabled={CC.completionRequested}
            onClick={() => {
              setEditing(true);
            }}
            className={clsx(CC.completionRequested ? 'cursor-not-allowed' : '')}
          >
            <PencilSquareIcon className='h-5 w-5' aria-hidden='true' />
          </button>
        </div>
      </Tooltip>
    );
  };

  //-- 'Enter' w/o 'Shift' to submit prompt, 'Shift + Enter' for newline --//
  const keyDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); //-- Prevent default behavior (newline insertion) --//
      //-- prevent submit while loading or if `disableSubmitPrompt` is true --//
      if (!CC.completionRequested && !disableSubmitPrompt) submitEditedPrompt();
    } //-- else "Enter" with shift will just insert a newline --//
  };

  //-- Submit edited prompt, create new branch --//
  const submitEditedPrompt = async () => {
    // const accessToken = await getAccessTokenSilently();

    try {
      //-- Send prompt as chat message --//
      await send_message(accessToken, promptContent, row.parent_node_id, CC);
    } catch (err) {
      if (err instanceof ErrorForChatToast) {
        chatToast(err.message);
      } else if (err instanceof ErrorForToast) {
        toast(err.message);
      } else if (err instanceof Error) {
        toast(err.message);
      }
    }
  };
  //-- When textarea focuses, put cursor after the last char --//
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [textareaOnFocusToggle]);

  //-- Copy to Clipboard --//
  const [copying, setCopied] = useState<boolean>(false);
  const CopyToClipboardButton = () => {
    return (
      <Tooltip content='Copy' placement='top' hidden={CC.completionRequested}>
        <div
          className={clsx(
            CC.completionRequested ? 'cursor-not-allowed' : '',
            'flex flex-row justify-center rounded-full p-1 text-zinc-600 dark:text-zinc-300',
            copying
              ? 'bg-green-300 text-green-900 dark:bg-green-800 dark:text-green-200'
              : 'dark:hover:bg-text-200 hover:bg-zinc-300 hover:text-zinc-700 dark:hover:bg-zinc-700'
          )}
        >
          <button
            disabled={CC.completionRequested}
            onClick={() => {
              copyToClipboard(row.content);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 750);
            }}
            className={clsx(CC.completionRequested ? 'cursor-not-allowed' : '')}
          >
            <ClipboardDocumentIcon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
      </Tooltip>
    );
  };

  const Author = ({ mobile }: { mobile: boolean }) => {
    //-- If author is the current user, display their profile photo --//
    // if (row.author === user?.sub) {
    //   if (user?.picture) {
    //     return (
    //       <div
    //         className={clsx(
    //           mobile
    //             ? 'flex w-14 flex-col items-start'
    //             : 'flex w-16 flex-col items-center'
    //         )}
    //       >
    //         <img
    //           src={user?.picture}
    //           referrerPolicy='no-referrer' //-- Prevents intermittent 403 error, https://community.auth0.com/t/google-account-picture-request-forbidden/42031/11 --//
    //           alt={user?.name || 'user photo'}
    //           className={clsx(
    //             mobile ? 'h-8 w-8 rounded-full' : 'h-10 w-10 rounded-full'
    //           )}
    //         />
    //       </div>
    //     );
    //   } else {
    //     return (
    //       <div
    //         className={clsx(
    //           mobile
    //             ? 'flex flex-row items-center gap-x-1'
    //             : 'flex w-16 flex-col items-center'
    //         )}
    //       >
    //         <UserCircleIcon
    //           className={clsx(
    //             mobile
    //               ? 'h-8 w-8 text-zinc-500 dark:text-zinc-400'
    //               : 'h-8 w-8 text-zinc-500 dark:text-zinc-400'
    //           )}
    //         />
    //       </div>
    //     );
    //   }
    // }

    //-- If author is a model, display name of the model --//
    if (row.author === row.model.model_api_name) {
      return (
        <div
          className={clsx(
            mobile
              ? 'flex flex-row items-center gap-x-1'
              : 'flex w-full flex-col items-center'
          )}
        >
          <CpuChipIcon className='h-8 w-8 text-zinc-500 dark:text-zinc-400' />
          <div className='text-xs font-semibold text-zinc-500 dark:text-zinc-400'>
            {getFriendly(
              row.model.model_api_name,
              CC.model_friendly_names,
              'model_friendly_name'
            )}
          </div>
        </div>
      );
    }
    return (
      <div
        className={clsx(
          mobile
            ? 'flex flex-row items-center gap-x-1'
            : 'flex w-16 flex-col items-center'
        )}
      >
        <CpuChipIcon
          className={clsx(
            mobile
              ? 'h-8 w-8 text-zinc-500 dark:text-zinc-400'
              : 'h-8 w-8 text-zinc-500 dark:text-zinc-400'
          )}
        />
      </div>
    );
  };

  //-- Message Row MessageData --//
  const Timestamp = () => {
    let friendlyDate = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      // second: "2-digit",
    }).format(new Date(row.created_at));

    return (
      <div
        className={clsx(
          'flex flex-row justify-center text-sm',
          hover
            ? 'text-zinc-600 dark:text-zinc-300'
            : 'text-zinc-500 dark:text-zinc-400'
        )}
      >
        {friendlyDate}
      </div>
    );
  };

  //-- Version Selector --//
  const VersionSelector = () => {
    return (
      <div className='my-1 flex flex-row justify-center'>
        {/*-- If current node is > sibling 1, allow decrement --*/}
        {row.sibling_node_ids.indexOf(row.node_id) > 0 ? (
          <button
            disabled={CC.completionRequested}
            onClick={() => {
              changeBranchHandler(-1); //-- Decrement sibling --//
            }}
            className={clsx(
              'flex flex-col justify-end pb-0.5',
              CC.completionRequested ? 'cursor-not-allowed' : ''
            )}
          >
            <ChevronLeftIcon
              className='h-4 w-4 rounded-full text-zinc-400 hover:bg-zinc-300 hover:text-zinc-700 dark:hover:bg-zinc-500 dark:hover:text-zinc-100'
              aria-hidden='true'
            />
          </button>
        ) : (
          //-- placeholder --//
          <span className='h-4 w-4' />
        )}

        {/*-- If multiple siblings, show version numbers --*/}
        {row.sibling_node_ids.length > 1 && (
          <p className='text-sm text-zinc-400'>
            {`${row.sibling_node_ids.indexOf(row.node_id) + 1}`} /{' '}
            {`${row.sibling_node_ids.length}`}
          </p>
        )}

        {/*-- If current node is < final sibling, allow increment --*/}
        {row.sibling_node_ids.indexOf(row.node_id) + 1 <
        row.sibling_node_ids.length ? (
          <button
            disabled={CC.completionRequested}
            onClick={() => {
              changeBranchHandler(1); //-- Increment sibling --//
            }}
            className={clsx(
              'flex flex-col justify-end pb-0.5',
              CC.completionRequested ? 'cursor-not-allowed' : ''
            )}
          >
            <ChevronRightIcon
              className='h-4 w-4 rounded-full text-zinc-400 hover:bg-zinc-300 hover:text-zinc-700 dark:hover:bg-zinc-500 dark:hover:text-zinc-100'
              aria-hidden='true'
            />
          </button>
        ) : (
          //-- placeholder --//
          <span className='h-4 w-4' />
        )}
      </div>
    );
  };

  //-- Track row hover state --//
  const [hover, setHover] = useState<boolean>(false);
  const mouseEnterHandler = () => {
    setHover(true);
  };
  const mouseLeaveHandler = () => {
    setHover(false);
  };

  return (
    <div
      id='chat-row'
      className={clsx(
        row.role === 'user' ? '' : 'rounded-md bg-zinc-200 dark:bg-zinc-800',
        'w-full justify-center lg:flex'
      )}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {/* Mobile Row Top - visible until 'lg' */}
      <div className='lg:hidden'>
        <div className='flex flex-row items-center py-2 pl-2 pr-2'>
          <div className='flex flex-row items-center'>
            <Author mobile={true} />
            {row.prompt_or_completion === 'prompt' && <VersionSelector />}
          </div>
          <div className='flex flex-grow flex-row items-center justify-end'>
            {row.prompt_or_completion === 'prompt' && <EditButton />}
            {/* Cancel or Confirm Edit buttons */}
            {editing && (
              <div className='flex flex-row'>
                <div className='ml-1 flex items-center rounded-full text-blue-500 dark:text-blue-500'>
                  <button
                    onClick={() => {
                      setEditing(false);
                    }}
                  >
                    <XCircleIcon className='h-6 w-6' />
                  </button>
                </div>
                <div className='mx-1 flex items-center rounded-full text-blue-500 dark:text-blue-500'>
                  <button
                    onClick={() => {
                      submitEditedPrompt();
                      setEditing(false);
                    }}
                  >
                    <CheckCircleIcon className='h-6 w-6' />
                  </button>
                </div>
              </div>
            )}
            {!editing && (
              <>
                {row.prompt_or_completion === 'completion' && (
                  <RegenerateButton />
                )}
                <CopyToClipboardButton />
              </>
            )}
            <div className='w-16'>
              <Timestamp />
            </div>
          </div>
        </div>
      </div>

      {/* Author - visible for 'lg' and larger */}
      <div
        id='chat-author-content'
        className='my-3.5 hidden w-full flex-col items-center justify-start lg:flex lg:w-24'
      >
        <Author mobile={false} />
        {row.prompt_or_completion === 'prompt' && <VersionSelector />}
      </div>

      {/* MESSAGE - always visible */}
      <div
        id='chat-message'
        className='mx-auto flex w-full max-w-prose lg:mx-0'
      >
        <article className='prose prose-zinc w-full max-w-prose dark:prose-invert dark:text-white max-lg:pl-2.5'>
          {editing ? (
            <TextareaAutosize
              autoFocus
              onFocus={() =>
                setTextareaOnFocusToggle((prevState) => !prevState)
              }
              ref={textareaRef}
              value={promptContent}
              maxRows={25} //-- arbitrary number --//
              onChange={(event) => setPromptContent(event.target.value)}
              onKeyDown={keyDownHandler}
              className={clsx(
                'mb-2.5 mt-0.5 block w-full resize-none rounded-lg border-0 px-3 py-3 text-base leading-6 ring-2 focus:ring-2 lg:mb-4 lg:mt-6',
                'text-zinc-900 ring-green-600 focus:ring-green-600',
                CC.completionRequested
                  ? 'animate-pulse bg-zinc-300 dark:bg-zinc-500'
                  : promptTooLong && !prompt2XTooLong
                  ? 'bg-orange-300 ring-1 ring-orange-400 focus:ring-2 focus:ring-orange-400 dark:ring-orange-600 dark:focus:ring-orange-600'
                  : prompt2XTooLong
                  ? 'bg-rose-300 ring-1 ring-rose-400 focus:ring-2 focus:ring-rose-400 dark:ring-rose-600 dark:focus:ring-rose-600'
                  : 'bg-white ring-1 ring-inset ring-zinc-300 dark:bg-zinc-700 dark:text-white'
              )}
            />
          ) : (
            <li key={row.role}>
              <ReactMarkdown
                children={row.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, children }) => (
                    <p className='max-lg:m-0 max-lg:p-0 max-lg:pb-2'>
                      {children}
                    </p>
                  ),
                }}
              />
            </li>
          )}
        </article>
      </div>

      {/* Timestamp, Edit, Regenerate, Copy - visible for 'lg' and larger */}
      <div
        id='chat-MessageData-content-lg'
        className='mt-5 hidden w-full flex-col pr-2 lg:flex lg:w-24'
      >
        <div className='flex flex-col justify-end'>
          <Timestamp />
          <div className='flex flex-row justify-center'>
            {hover && !editing && (
              <>
                {row.prompt_or_completion === 'prompt' && <EditButton />}
                {row.prompt_or_completion === 'completion' && (
                  <RegenerateButton />
                )}
                <CopyToClipboardButton />
              </>
            )}
            {editing && (
              <>
                <div className='flex items-center rounded-full p-1 text-zinc-500 hover:bg-blue-500 hover:bg-opacity-20 hover:text-blue-500 dark:text-zinc-500 dark:hover:text-blue-500'>
                  <button
                    onClick={() => {
                      setEditing(false);
                    }}
                  >
                    <XCircleIcon className='h-5 w-5' />
                  </button>
                </div>
                <div className='flex items-center rounded-full p-1 text-zinc-500 hover:bg-blue-500 hover:bg-opacity-20 hover:text-blue-500 dark:text-zinc-500 dark:hover:text-blue-500'>
                  <button
                    onClick={() => {
                      submitEditedPrompt();
                      setEditing(false);
                    }}
                  >
                    <CheckCircleIcon className='h-5 w-5' />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
