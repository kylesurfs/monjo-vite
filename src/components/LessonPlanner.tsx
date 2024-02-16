//-- react, react-router-dom, Auth0 --//
import { Fragment, useEffect, useState } from 'react';

//-- NPM Components --//
import { Dialog, Transition, Listbox } from '@headlessui/react';
import {
  Bars3Icon,
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import { Field, Label } from '../@/components/ui/tailwind/fieldset';
import { BadgeButton } from '../@/components/ui/tailwind/badge';
import { Button } from '../@/components/ui/tailwind/button';

//-- TSX Components: GPT --//
import FirstGPTRequest from './FirstGPTRequest';

//-- Types: LessonPlanner --//
import {
  Grade,
  Subject,
  State,
  LessonStandard,
  DesiredOutputs,
  SelectedDesiredOutputs,
  LessonPlanDataType,
} from '../Types/lessonPlanTypes';

//-- Data: LessonPlanner --//
import {
  grades,
  subjects,
  states,
  lessonStandards,
  desiredOutputsButtons,
} from '../Types/lessonPlanTypes';

//-- Context: LessonPlanner --//
import { useLessonPlanCreation } from '../Context/LessonPlanCreationContext';
import { IMessage } from '../App/GPT/chatson/chatson_types';
import { useChatContext } from '../Context/ChatContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface LessonPlannerProps {
  onLessonPlanSubmit: (lessonPlanContent: string) => void;
}

//== ***** ***** ***** Exported Component ***** ***** ***** ==//
export default function LessonPlanner({
  onLessonPlanSubmit,
}: LessonPlannerProps) {
  const { createLessonPlan, setLessonPlanData, sendPrompt } =
    useLessonPlanCreation();
  const { resetCounter } = useChatContext();

  //== React State, Custom Hooks ==//

  //-- useState for initial form state --//
  const initialFormState: LessonPlanDataType = {
    grade: grades[3],
    subject: subjects[0],
    state: states[4],
    lessonStandard: lessonStandards[0],
    prompt: '',
    desiredOutputs: '',
    selectedDesiredOutputs: {}, // Assuming this starts as an empty selection
  };

  const [formState, setFormState] =
    useState<LessonPlanDataType>(initialFormState);

  useEffect(() => {
    // Reset internal state logic here
    setFormState(initialFormState);
    // For example, reset form states to their initial values
    // Optionally, call a method to clear the reset signal if needed
    // This might not be necessary depending on your implementation
  }, [resetCounter]);

  //-- Button handling, for desiredOutputs options --//
  type ButtonColors = Record<string, string>;

  // Initial state setup where all buttons are set to 'zinc'
  const [buttonColors, setButtonColors] = useState<ButtonColors>(
    desiredOutputsButtons.reduce((acc: ButtonColors, output) => {
      acc[output.id] = 'zinc';
      return acc;
    }, {})
  );

  //-- Handle BadgeButton click for 'Desired Outputs' --//
  const handleClick = (id: string) => {
    setButtonColors((prevColors) => ({
      ...prevColors,
      [id]: prevColors[id] === 'zinc' ? 'blue' : 'zinc', // Toggle between 'zinc' and 'blue'
    }));
  };

  const handleClickDesiredOutputs = (outputId: string) => {
    setFormState((prevState) => {
      // Ensure selectedDesiredOutputs is defined or fallback to an empty object
      const safeSelectedDesiredOutputs = prevState.selectedDesiredOutputs || {};

      return {
        ...prevState,
        selectedDesiredOutputs: {
          ...safeSelectedDesiredOutputs,
          [outputId]: !safeSelectedDesiredOutputs[outputId],
        },
      };
    });
  };

  //-- DEV - Begin commented out code. Use this if we want to disable the textarea when buttons are selected --//
  // Check if any button is selected
  // const isAnyButtonSelected = Object.values(
  //   formState.selectedDesiredOutputs
  // ).some((value) => value);
  //-- DEV - End commented out code. Use this if we want to disable the textarea when buttons are selected --//

  const handleSubmit = () => {
    // Ensure selectedDesiredOutputs is defined or fallback to an empty object
    const safeSelectedDesiredOutputs = formState.selectedDesiredOutputs || {};

    // Filter and map selected desired outputs to their names
    const selectedOutputs = Object.entries(safeSelectedDesiredOutputs)
      .filter(([_, isSelected]) => isSelected)
      .map(([key, _]) => {
        const output = desiredOutputsButtons.find(
          (output) => output.id === key
        );
        return output ? output.name : '';
      })
      .filter((name) => name); // Remove any undefined entries, just in case

    const lessonPlanData: LessonPlanDataType = {
      grade: formState.grade,
      subject: formState.subject,
      state: formState.state,
      lessonStandard: formState.lessonStandard,
      prompt: formState.prompt, // Assuming you have a state called `prompt` for the textarea
      // desiredOutputs: formState.desiredOutputs, // Assuming this state captures the textarea input
      // selectedDesiredOutputs: Object.keys(formState.selectedDesiredOutputs)
      //   .filter((key) => formState.selectedDesiredOutputs[key])
      //   .map(
      //     (id) => desiredOutputsButtons.find((output) => output.id === id)?.name
      //   ), // This assumes `selectedDesiredOutputs` is an object where selected keys are true
      desiredOutputs: selectedOutputs.join(', '), // Join the selected outputs by comma or however you wish to format them
    };

    // Prepare the prompt message for sending
    const promptMessage: IMessage = {
      author: 'user', // or however you determine the author
      model: {
        api_provider_name: 'openai',
        model_developer_name: 'openai',
        model_api_name: 'gpt-3.5-turbo',
      },
      created_at: new Date().toISOString(),
      role: 'user',
      content: JSON.stringify(lessonPlanData), // Use the prompt content from the form state
    };

    // console.log(lessonPlanData); //-- TODO - Replace with api logic --//

    //-- Lesson Planner context --//
    // Update the context's lesson plan data state
    const lessonPlanContent = JSON.stringify(lessonPlanData);
    onLessonPlanSubmit(lessonPlanContent);

    // Set the context value to indicate the lesson plan was created
    createLessonPlan();
    setLessonPlanData(lessonPlanData);
  };

  //== ***** ***** ***** Component Return ***** ***** ***** ==//
  return (
    <>
      <div>
        <main className='bg-gray-50 dark:bg-transparent'>
          <header className='flex flex-col lg:flex-row items-center lg:justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <Field className='w-full lg:w-auto flex flex-col sm:items-center lg:items-start sm:flex-row lg:flex-col text-xs sm:text-sm pb-4'>
              <Label className='text-sm w-40 lg:w-32 lg:text-lg font-semibold leading-7 dark:text-gray-100 text-gray-800 pr-4'>
                Grade
              </Label>
              <Listbox
                value={formState.grade}
                onChange={(newGrade) => {
                  setFormState((prevState) => ({
                    ...prevState,
                    grade: newGrade,
                  }));
                }}
              >
                {({ open }) => (
                  <>
                    <div className='relative mt-2 flex-grow'>
                      <Listbox.Button className='relative w-full lg:w-32 cursor-default rounded-md bg-white dark:bg-transparent py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6'>
                        <span className='block truncate'>
                          {formState.grade.name}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <ChevronUpDownIcon
                            className='h-5 w-5 text-gray-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-600 dark:text-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                          {grades.map((grade: Grade) => (
                            <Listbox.Option
                              key={grade.id}
                              className={({ focus }) =>
                                classNames(
                                  focus
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-900 dark:text-gray-400',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={grade}
                            >
                              {({ selected, focus }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected
                                        ? 'font-semibold'
                                        : 'font-normal',
                                      'block truncate'
                                    )}
                                  >
                                    {grade.name}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        focus
                                          ? 'text-white'
                                          : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </Field>

            {/* Subject */}
            <Field className='w-full lg:w-auto flex flex-col sm:items-center lg:items-start sm:flex-row lg:flex-col text-xs sm:text-sm pb-4'>
              <Label className='text-sm w-40 lg:w-48 lg:text-lg font-semibold leading-7 dark:text-gray-100 text-gray-800 pr-4'>
                Subject
              </Label>
              <Listbox
                value={formState.subject}
                onChange={(newSubject) => {
                  setFormState((prevState) => ({
                    ...prevState,
                    subject: newSubject,
                  }));
                }}
              >
                {({ open }) => (
                  <>
                    <div className='relative mt-2 flex-grow'>
                      <Listbox.Button className='relative w-full lg:w-48 cursor-default rounded-md bg-white dark:bg-transparent py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6'>
                        <span className='block truncate'>
                          {formState.subject.name}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <ChevronUpDownIcon
                            className='h-5 w-5 text-gray-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-600 dark:text-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                          {subjects.map((subject: Subject) => (
                            <Listbox.Option
                              key={subject.id}
                              className={({ focus }) =>
                                classNames(
                                  focus
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-900 dark:text-gray-400',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={subject}
                            >
                              {({ selected, focus }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected
                                        ? 'font-semibold'
                                        : 'font-normal',
                                      'block truncate'
                                    )}
                                  >
                                    {subject.name}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        focus
                                          ? 'text-white'
                                          : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </Field>

            <Field className='w-full lg:w-auto flex flex-col sm:items-center lg:items-start sm:flex-row lg:flex-col text-xs sm:text-sm pb-4'>
              <Label className='text-sm w-40 lg:w-48 lg:text-lg font-semibold leading-7 dark:text-gray-100 text-gray-800 pr-4'>
                State
              </Label>
              <Listbox
                value={formState.state}
                onChange={(newState) => {
                  setFormState((prevState) => ({
                    ...prevState,
                    state: newState,
                  }));
                }}
              >
                {({ open }) => (
                  <>
                    <div className='relative mt-2 flex-grow'>
                      <Listbox.Button className='relative w-full lg:w-48 cursor-default rounded-md bg-white dark:bg-transparent py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6'>
                        <span className='block truncate'>
                          {formState.state.name}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <ChevronUpDownIcon
                            className='h-5 w-5 text-gray-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-600 dark:text-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                          {states.map((state: State) => (
                            <Listbox.Option
                              key={state.id}
                              className={({ focus }) =>
                                classNames(
                                  focus
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-900 dark:text-gray-400',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={state}
                            >
                              {({ selected, focus }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected
                                        ? 'font-semibold'
                                        : 'font-normal',
                                      'block truncate'
                                    )}
                                  >
                                    {state.name}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        focus
                                          ? 'text-white'
                                          : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </Field>

            {/* Lesson Standards */}
            <Field className='w-full lg:w-auto flex flex-col sm:items-center lg:items-start sm:flex-row lg:flex-col text-xs sm:text-sm pb-4'>
              <Label className='text-xs sm:text-sm lg:text-lg w-40 lg:w-80 font-semibold leading-7 dark:text-gray-100 text-gray-800 pr-4'>
                Lesson Standards
              </Label>
              <Listbox
                value={formState.lessonStandard}
                onChange={(newLessonStandards) => {
                  setFormState((prevState) => ({
                    ...prevState,
                    lessonStandard: newLessonStandards,
                  }));
                }}
              >
                {({ open }) => (
                  <>
                    <div className='relative mt-2 flex-grow'>
                      <Listbox.Button className='relative w-full lg:w-96 cursor-default rounded-md bg-white dark:bg-transparent py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs sm:text-sm sm:leading-6'>
                        <span className='block truncate'>
                          {formState.lessonStandard.name}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <ChevronUpDownIcon
                            className='h-5 w-5 text-gray-400'
                            aria-hidden='true'
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-600 dark:text-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                          {lessonStandards.map((lesson: LessonStandard) => (
                            <Listbox.Option
                              key={lesson.id}
                              className={({ focus }) =>
                                classNames(
                                  focus
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-900 dark:text-gray-400',
                                  'relative cursor-default select-none py-2 pl-3 pr-9 text-sm'
                                )
                              }
                              value={lesson}
                            >
                              {({ selected, focus }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected
                                        ? 'font-semibold'
                                        : 'font-normal',
                                      'block truncate'
                                    )}
                                  >
                                    {lesson.name}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        focus
                                          ? 'text-white'
                                          : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </Field>
          </header>

          {/* Prompt */}
          <div className='col-span-full px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8'>
            <label
              htmlFor='about'
              className='block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900'
            >
              Prompt
            </label>
            <div className='mt-2'>
              <textarea
                id='about'
                name='about'
                rows={5}
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 dark:bg-gray-800 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                defaultValue={''}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    prompt: e.target.value,
                  }))
                }
                placeholder='Write a few sentences to prompt MonjoAI for lesson plans.'
              />
            </div>

            {/* Desired outputs */}

            {/* Desired Outputs Section */}
            {/* <div className='col-span-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <label className='block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900'>
            Desired Outputs
            </label>
            
            <textarea
            id='about'
            name='about'
            rows={5}
            className='block w-full rounded-md border-0 py-1.5 text-gray-900 dark:bg-gray-800 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            //-- Begin commented out toggle based on button select --//
            // disabled={isAnyButtonSelected} //-- DEV - Optional disable in case we ONLY want to use pre-sets or text area, instead of both --//
            // className={`block w-full rounded-md border py-1.5 text-gray-900 ${
              //   isAnyButtonSelected ? 'bg-gray-200' : 'bg-white'
              // } dark:bg-gray-800 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
              //-- End commented out toggle based on button select --//
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  desiredOutputs: e.target.value,
                }))
              }
              placeholder='Choose from common suggestions, or write your own.'
              />
              <div className='mt-2 flex flex-wrap gap-3'>
              {desiredOutputsButtons.map(({ id, name }) => (
                <BadgeButton
                key={id}
                color={formState.selectedDesiredOutputs[id] ? 'blue' : 'zinc'}
                onClick={() => handleClickDesiredOutputs(id)}
                >
                {name}
                </BadgeButton>
                ))}
                </div>
              </div> */}
            {/* TBD -- The option to display what will be sent to ChatGPT might not be needed or might be useful as a DEV-only option */}
            {/* TBD -- Might want to render it after submit, especially if that makes the original lesson plan hidden */}

            <div className='mt-6 col-span-full pb-4 sm:pb-6'>
              <label
                htmlFor='about'
                className='block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900'
              >
                Select One or More Desired Outputs (optional)
              </label>
              <div className='mt-2 flex flex-wrap gap-3'>
                {desiredOutputsButtons.map(({ id, name }) => (
                  <BadgeButton
                    key={id}
                    color={
                      formState.selectedDesiredOutputs?.[id] ? 'blue' : 'zinc'
                    }
                    onClick={() => handleClickDesiredOutputs(id)}
                  >
                    {name}
                  </BadgeButton>
                ))}
              </div>
            </div>
          </div>

          {/* TODO -- INSERT CHAT */}
          <div className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <Button className='w-full' color='emerald' onClick={handleSubmit}>
              Create lesson plan
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
