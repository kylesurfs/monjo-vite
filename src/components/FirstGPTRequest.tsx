//== react, react-router-dom, Auth0 ==//

//== TSX Components, Functions ==//
import { useLessonPlanCreation } from '../Context/LessonPlanCreationContext';

//== NPM Components ==//
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../@/components/ui/shadcn/accordion';

//== ***** ***** ***** Exported Component ***** ***** ***** ==//
export default function FirstGPTRequest() {
  const { lessonPlanData } = useLessonPlanCreation();

  //== ***** ***** ***** Component Return ***** ***** ***** ==//
  return (
    <>
      {/* Accordian to see the first GPT request */}
      <div className='col-span-full mt-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 text-sm font-medium leading-6 dark:text-gray-100 text-gray-900'>
        <Accordion type='single' collapsible>
          <AccordionItem value='item-1'>
            <AccordionTrigger>
              Click to see the output that was sent to monjoAI
            </AccordionTrigger>
            <AccordionContent>
              {lessonPlanData ? (
                <div>
                  <p>
                    <strong>Grade:</strong> {lessonPlanData.grade.name}
                  </p>
                  <p>
                    <strong>Subject:</strong> {lessonPlanData.subject.name}
                  </p>
                  <p>
                    <strong>State:</strong> {lessonPlanData.state.name}
                  </p>
                  <p>
                    <strong>Lesson Standard:</strong>{' '}
                    {lessonPlanData.lessonStandard.name}
                  </p>
                  <p>
                    <strong>Prompt:</strong> {lessonPlanData.prompt}
                  </p>
                  <p>
                    <strong>Selected Desired Outputs:</strong>{' '}
                    {lessonPlanData.desiredOutputs}
                  </p>
                  {/* {lessonPlanData.selectedDesiredOutputs && (
                    <div>
                      <strong>Selected Desired Outputs:</strong>
                      <ul>
                        {Object.keys(lessonPlanData.selectedDesiredOutputs)
                          .filter(
                            (key) => lessonPlanData.selectedDesiredOutputs[key]
                          )
                          .map((id) => (
                            <li key={id}>{id}</li> // TODO - map to name
                          ))}
                      </ul>
                    </div>
                  )} */}
                </div>
              ) : (
                'No lesson plan data available.'
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
