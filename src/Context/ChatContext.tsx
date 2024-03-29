//-- react --//
import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react';

//-- types --//
import {
  IConversation,
  IMessageRow,
  IModel,
  IModelFriendly,
  ModelAPINames,
} from '../App/GPT/chatson/chatson_types';

import { TOKEN_LIMITS } from '../App/GPT/chatson/chatson_vals';
import { generateDummyToken } from '../Util/generateDummyToken';

//-- Create interface and Context --//
export interface IChatContext {
  conversationsArray: IConversation[];
  setConversationsArray: React.Dispatch<React.SetStateAction<IConversation[]>>;
  conversationsFetched: Boolean;
  setConversationsFetched: React.Dispatch<React.SetStateAction<boolean>>;
  rowArray: IMessageRow[] | null;
  setRowArray: React.Dispatch<React.SetStateAction<IMessageRow[] | null>>;
  conversationId: string | null;
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  conversation: IConversation | null;
  setConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
  model: IModel;
  setModel: React.Dispatch<React.SetStateAction<IModel>>;
  modelTokenLimit: number;
  model_friendly_names: Partial<Record<ModelAPINames, Object>>;
  model_options: Partial<Record<ModelAPINames, IModel>>;
  temperature: number | null;
  setTemperature: React.Dispatch<React.SetStateAction<number | null>>;
  completionRequested: boolean;
  setCompletionRequested: React.Dispatch<React.SetStateAction<boolean>>;
  completionStreaming: boolean;
  setCompletionStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  sortBy: 'last_edited' | 'created_at';
  setSortBy: React.Dispatch<React.SetStateAction<'last_edited' | 'created_at'>>;
  focusTextarea: boolean;
  setFocusTextarea: React.Dispatch<React.SetStateAction<boolean>>;
  //-- KYLE additions for dummy access token below --//
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  updateTrigger: number; //-- KYLE: Using to try to force a component re-render during SSE --//
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>; //-- KYLE: Using to try to force a component re-render during SSE --//
  resetCounter: number; // Replace resetSignal with resetCounter
  triggerReset: () => void; //-- Kyle: Using for 'New Conversation' button on sidebar --//
}

const ChatContext = createContext<IChatContext | undefined>(undefined);

//-- Custom Provider Component --//
function ChatContextProvider({ children }: PropsWithChildren) {
  //-- KYLE -- Initialize dummy access token state
  const [accessToken, setAccessToken] = useState<string>(generateDummyToken());

  //-- Enumerate current model options --//
  const model_options: Partial<Record<ModelAPINames, IModel>> = {
    'gpt-3.5-turbo': {
      api_provider_name: 'openai',
      model_developer_name: 'openai',
      model_api_name: 'gpt-3.5-turbo',
    },
    'gpt-3.5-turbo-16k': {
      api_provider_name: 'openai',
      model_developer_name: 'openai',
      model_api_name: 'gpt-3.5-turbo-16k',
    },
    'gpt-4': {
      api_provider_name: 'openai',
      model_developer_name: 'openai',
      model_api_name: 'gpt-4',
    },
    // claude: {
    //   api_provider_name: "amazon_bedrock",
    //   model_developer_name: "anthropic",
    //   model_api_name: "claude",
    // },
    // "jurrasic-2": {
    //   api_provider_name: "amazon_bedrock",
    //   model_developer_name: "ai21labs",
    //   model_api_name: "jurrasic-2",
    // },
    // "amazon-titan": {
    //   api_provider_name: "amazon_bedrock",
    //   model_developer_name: "amazon",
    //   model_api_name: "amazon-titan",
    // },
    // "google-palm-2": {
    //   api_provider_name: "google",
    //   model_developer_name: "google",
    //   model_api_name: "google-palm-2",
    // },
  };
  const model_friendly_names: Partial<Record<ModelAPINames, IModelFriendly>> = {
    'gpt-3.5-turbo': {
      api_provider_friendly_name: 'OpenAI',
      model_developer_friendly_name: 'OpenAI',
      model_developer_link: 'https://openai.com',
      model_friendly_name: 'GPT-3.5',
      model_description: 'Power and Speed (4k tokens)',
    },
    'gpt-3.5-turbo-16k': {
      api_provider_friendly_name: 'OpenAI',
      model_developer_friendly_name: 'OpenAI',
      model_developer_link: 'https://openai.com',
      model_friendly_name: 'GPT-3.5-16k',
      model_description: 'Power and Speed (16k tokens)',
    },
    'gpt-4': {
      api_provider_friendly_name: 'OpenAI',
      model_developer_friendly_name: 'OpenAI',
      model_developer_link: 'https://openai.com',
      model_friendly_name: 'GPT-4',
      model_description: 'Max Power (slower)',
    },
    // claude: {
    //   api_provider_friendly_name: "Amazon Bedrock",
    //   model_developer_friendly_name: "Anthropic",
    //   model_developer_link: "https://anthropic.com",
    //   model_friendly_name: "Claude",
    //   model_description: "General purpose LLM",
    // },
    // "jurrasic-2": {
    //   api_provider_friendly_name: "Amazon Bedrock",
    //   model_developer_friendly_name: "AI21",
    //   model_developer_link: "https://ai21.com",
    //   model_friendly_name: "Jurrasic 2",
    //   model_description: "General purpose LLM",
    // },
    // "amazon-titan": {
    //   api_provider_friendly_name: "Amazon Bedrock",
    //   model_developer_friendly_name: "Amazon",
    //   model_developer_link: "https://aws.amazon.com/bedrock/titan",
    //   model_friendly_name: "Titan",
    //   model_description: "General purpose LLM",
    // },
    // "google-palm-2": {
    //   api_provider_friendly_name: "Google PaLM 2",
    //   model_developer_friendly_name: "Google",
    //   model_developer_link: "https://ai.google/discover/palm2",
    //   model_friendly_name: "PaLM 2",
    //   model_description: "General purpose LLM",
    // },
  };

  //-- State values --//
  const [conversationsArray, setConversationsArray] = useState<IConversation[]>(
    []
  );
  const [conversationsFetched, setConversationsFetched] =
    useState<boolean>(false);
  const [rowArray, setRowArray] = useState<IMessageRow[] | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [model, setModel] = useState<IModel>(
    model_options['gpt-3.5-turbo'] as IModel
  );
  const [modelTokenLimit, setModelTokenLimit] = useState<number>(
    TOKEN_LIMITS[model.model_api_name]
  );
  const [temperature, setTemperature] = useState<number | null>(null);
  const [completionRequested, setCompletionRequested] =
    useState<boolean>(false);
  const [completionStreaming, setCompletionStreaming] =
    useState<boolean>(false);
  let abortControllerRef = useRef<AbortController | null>(null);
  const [focusTextarea, setFocusTextarea] = useState<boolean>(false);
  const localStorage_sortBy = localStorage.getItem('sortBy');
  const [sortBy, setSortBy] = useState<'last_edited' | 'created_at'>(
    localStorage_sortBy === 'created_at' ? 'created_at' : 'last_edited'
  );
  const [updateTrigger, setUpdateTrigger] = useState(0); // Initialize with 0
  const [resetCounter, setResetCounter] = useState(0); // Use a counter for resets
  const triggerReset = () => {
    setResetCounter((prevCounter) => prevCounter + 1);
  };

  //-- Update modelTokenLimit when model is updated --//
  useEffect(() => {
    setModelTokenLimit(TOKEN_LIMITS[model.model_api_name]);
  }, [model]);

  //-- Bundle values into chatContextValue --//
  const chatContextValue: IChatContext = {
    conversationsArray,
    setConversationsArray,
    conversationsFetched,
    setConversationsFetched,
    rowArray,
    setRowArray,
    conversationId,
    setConversationId,
    conversation,
    setConversation,
    model,
    setModel,
    modelTokenLimit,
    model_friendly_names,
    temperature,
    setTemperature,
    model_options,
    completionRequested,
    setCompletionRequested,
    completionStreaming,
    setCompletionStreaming,
    abortControllerRef,
    focusTextarea,
    setFocusTextarea,
    sortBy,
    setSortBy,
    //-- KYLE: dummy access token additions --//
    accessToken,
    setAccessToken,
    updateTrigger,
    setUpdateTrigger,
    resetCounter,
    triggerReset,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
}

//-- Custom Consumer Hook --//
function useChatContext() {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
}

//-- Export Provider Component and Consumer Hook ---//
export { ChatContextProvider, useChatContext };
