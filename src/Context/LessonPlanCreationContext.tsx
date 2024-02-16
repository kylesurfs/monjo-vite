import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { LessonPlanDataType } from '../Types/lessonPlanTypes';
import { IMessage } from '../App/GPT/chatson/chatson_types';
import { send_message } from '../App/GPT/chatson/Functions/send_message';
import { useChatContext } from './ChatContext';

// Adding a type for the function to handle completion content
type HandleCompletionContent = (content: string) => void;

interface LessonPlanCreationContextType {
  isLessonPlanCreated: boolean;
  lessonPlanData: LessonPlanDataType | null;
  createLessonPlan: () => void;
  setLessonPlanData: (data: LessonPlanDataType) => void;
  // Updated to include handleCompletionContent parameter
  sendPrompt: (
    prompt: IMessage,
    handleCompletionContent: HandleCompletionContent
  ) => Promise<void>;
}

const LessonPlanCreationContext = createContext<
  LessonPlanCreationContextType | undefined
>(undefined);

export function useLessonPlanCreation(): LessonPlanCreationContextType {
  const context = useContext(LessonPlanCreationContext);
  if (!context) {
    throw new Error(
      'useLessonPlanCreation must be used within a LessonPlanCreationProvider'
    );
  }
  return context;
}

interface LessonPlanCreationProviderProps {
  children: ReactNode;
}

export const LessonPlanCreationProvider: React.FC<
  LessonPlanCreationProviderProps
> = ({ children }) => {
  const [isLessonPlanCreated, setIsLessonPlanCreated] =
    useState<boolean>(false);
  const [lessonPlanData, setLessonPlanData] =
    useState<LessonPlanDataType | null>(null);
  const chatContext = useChatContext();

  const sendPrompt = useCallback(
    async (
      prompt: IMessage,
      handleCompletionContent: HandleCompletionContent
    ): Promise<void> => {
      // Assume accessToken and parentNodeId are retrieved correctly from chatContext
      const accessToken = chatContext.accessToken;
      const parentNodeId =
        chatContext.rowArray?.[chatContext.rowArray.length - 1]?.node_id ||
        null;

      try {
        await send_message(
          accessToken,
          prompt.content,
          parentNodeId,
          chatContext,
          handleCompletionContent // Passing the completion content handler to send_message
        );
      } catch (err) {
        // Handle errors accordingly
      }
    },
    [chatContext]
  ); // Ensure all necessary dependencies are included here

  // Listen to resetSignal from ChatContext and reset isLessonPlanCreated
  useEffect(() => {
    setIsLessonPlanCreated(false);
    // Optionally reset lessonPlanData here if needed
    setLessonPlanData(null);
  }, [chatContext.resetCounter]);

  const value = {
    isLessonPlanCreated,
    lessonPlanData,
    createLessonPlan: () => setIsLessonPlanCreated(true),
    setLessonPlanData,
    sendPrompt,
  };

  return (
    <LessonPlanCreationContext.Provider value={value}>
      {children}
    </LessonPlanCreationContext.Provider>
  );
};
