import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to='/'>
      <h1 className='text-3xl text-gray-800 dark:text-gray-100 font-semibold cursor-pointer'>
        monjoAI
      </h1>
    </Link>
  );
}
