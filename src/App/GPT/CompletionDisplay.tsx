import React from 'react';
// import ReactMarkdown from 'react-markdown';

// type CompletionDisplayProps = {
//   content: string;
// };

const CompletionDisplay: React.FC<{ content: string }> = ({ content }) => {
  //   return (
  //     <div className='p-4 bg-gray-100 rounded shadow'>
  //       <h3 className='text-lg font-semibold mb-2'>Completion Response:</h3>
  //       <ReactMarkdown className='prose'>{content}</ReactMarkdown>
  //     </div>
  return (
    <div className='p-4 bg-gray-100 rounded shadow'>
      <h3 className='text-lg font-semibold mb-2'>Lesson Plan:</h3>
      <pre className='whitespace-pre-wrap text-gray-800 text-sm'>{content}</pre>
    </div>
  );
};

export default CompletionDisplay;
