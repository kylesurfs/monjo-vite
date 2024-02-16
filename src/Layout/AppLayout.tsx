//-- react, react-router-dom, Auth0 --//
import { Fragment, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { Dialog, Transition, Listbox } from '@headlessui/react';
import {
  Cog6ToothIcon,
  FolderIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/20/solid';

//-- Component imports --//
// import Logo from '../Components/Logo';
import Logo from '../components/Logo';
// import { ModeToggle } from '../Components/mode-toggle';

import donaldKeypenis from '/Users/kylereagan/Documents/Monjo/monjo-vite/src/assets/donald_keypinis_small_square.png';
import ActiveDevelopmentBanner from '../components/ActiveDevelopmentBanner';
import clsx from 'clsx';
import Conversations from '../App/GPT/Sidebar/Conversations';

const navigation = [
  // { name: 'Lesson Planner', to: '/', icon: FolderIcon },
  //   { name: 'Subjects', to: '/subjects', icon: ServerIcon },
  //   { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
  { name: 'Lesson Planner', to: '/gpt', icon: ChatBubbleLeftRightIcon },
  { name: 'Roadmap', to: '/roadmap', icon: SignalIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //-- Synchronize with current pathname: (1) highlighted nav item, (2) secondary items in sidebar --//
  const { pathname } = useLocation();

  return (
    <>
      <div>
        {/* START OF MOBILE SIDEBAR */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as='div'
            className='relative z-50 xl:hidden'
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter='transition-opacity ease-linear duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity ease-linear duration-300'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-gray-900/80' />
            </Transition.Child>

            <div className='fixed inset-0 flex'>
              <Transition.Child
                as={Fragment}
                enter='transition ease-in-out duration-300 transform'
                enterFrom='-translate-x-full'
                enterTo='translate-x-0'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='translate-x-0'
                leaveTo='-translate-x-full'
              >
                <Dialog.Panel className='relative mr-16 flex w-full max-w-xs flex-1'>
                  <Transition.Child
                    as={Fragment}
                    enter='ease-in-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in-out duration-300'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                      <button
                        type='button'
                        className='-m-2.5 p-2.5'
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className='sr-only'>Close sidebar</span>
                        <XMarkIcon
                          className='h-6 w-6 text-gray-900 dark:text-white'
                          aria-hidden='true'
                        />
                      </button>
                    </div>
                  </Transition.Child>

                  {/* Sidebar component on small screens. Opens with hamburger. */}
                  <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-6 ring-1 ring-white/10'>
                    <div className='flex h-16 shrink-0 items-center'>
                      <Logo />
                    </div>

                    {/* START OF NAVIGATION ITEMS */}
                    <nav className='flex flex-1 flex-col'>
                      <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                          <ul role='list' className='-mx-2 space-y-1'>
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.to}
                                  // Use a function to dynamically assign classes based on active state
                                  className={({ isActive }) =>
                                    classNames(
                                      isActive
                                        ? 'bg-gray-400 dark:bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-400 dark:hover:bg-gray-800',
                                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                    )
                                  }
                                >
                                  <item.icon
                                    className='h-6 w-6 shrink-0'
                                    aria-hidden='true'
                                  />
                                  {item.name}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>

                        {/*-- START OF DIVIDER --*/}
                        <div
                          className={clsx(
                            'mx-2 mt-1.5 rounded-full border-t-2 border-zinc-300 dark:border-zinc-500'
                          )}
                          aria-hidden='true'
                        />
                        {/*-- END OF DIVIDER --*/}

                        {/* START OF SECONDARY ITEMS */}
                        <div
                          id='mobile-sidebar-secondary-items-list'
                          className='mx-2 my-1.5 flex-grow overflow-y-auto'
                        >
                          {pathname.startsWith('/gpt') && <Conversations />}
                        </div>
                        {/* END OF SECONDARY ITEMS */}

                        {/* END OF NAVIGATION ITEMS */}

                        {/* START OF PROFILE */}
                        <li className='-mx-6 mt-auto'>
                          <a
                            href='#'
                            className='flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-gray-400 dark:hover:bg-gray-800'
                          >
                            <img
                              className='h-8 w-8 rounded-full bg-gray-800'
                              src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                              alt=''
                            />
                            <span className='sr-only'>Your profile</span>
                            <span aria-hidden='true'>Donald Keypinis</span>
                          </a>
                        </li>
                        {/* END OF PROFILE */}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* END OF MOBILE SIDEBAR */}

        {/* START OF STATIC SIDEBAR FOR DESKTOP */}
        <div className='hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col'>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 dark:bg-black/10 px-6 ring-1 ring-white/5'>
            <div className='flex h-16 shrink-0 items-center'>
              <Logo />
            </div>

            {/* START OF NAVIGATION ITEMS */}
            <nav className='flex flex-1 flex-col'>
              <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                <li>
                  <ul role='list' className='-mx-2 space-y-1'>
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          // Use a function to dynamically assign classes based on active state
                          className={({ isActive }) =>
                            classNames(
                              isActive
                                ? 'bg-gray-400 dark:bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-400 dark:hover:bg-gray-800',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )
                          }
                        >
                          <item.icon
                            className='h-6 w-6 shrink-0'
                            aria-hidden='true'
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                {/*-- START OF DIVIDER --*/}
                <div
                  className={clsx(
                    'mx-2 mt-1.5 rounded-full border-t-2 border-zinc-300 dark:border-zinc-500'
                  )}
                  aria-hidden='true'
                />
                {/*-- END OF DIVIDER --*/}

                {/* START OF SECONDARY ITEMS */}
                <div
                  id='mobile-sidebar-secondary-items-list'
                  className='mx-2 my-1.5 flex-grow overflow-y-auto'
                >
                  {pathname.startsWith('/gpt') && <Conversations />}
                </div>
                {/* END OF SECONDARY ITEMS */}

                {/* END OF NAVIGATION ITEMS */}

                {/* START OF PROFILE */}
                <li className='-mx-6 mt-auto'>
                  <a
                    href='#'
                    className='flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-400 hover:text-white dark:hover:bg-gray-800'
                  >
                    <img
                      className='h-8 w-8 rounded-full bg-gray-800'
                      src={donaldKeypenis}
                      alt=''
                    />
                    <span className='sr-only'>Your profile</span>
                    <span aria-hidden='true'>Donald Keypinis</span>
                  </a>
                </li>
                {/* END OF PROFILE */}
              </ul>
            </nav>
          </div>
        </div>
        <header className='xl:pl-72'>
          <ActiveDevelopmentBanner />
        </header>

        <div className='xl:pl-72'>
          {/* Sticky search header */}
          <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-6 border-b border-white/5 bg-gray-50 dark:bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8'>
            <button
              type='button'
              className='-m-2.5 p-2.5 text-white xl:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <span className='sr-only'>Open sidebar</span>
              <Bars3Icon
                className='h-5 w-5 text-gray-500 dark:text-white'
                aria-hidden='true'
              />
            </button>

            <div className='flex flex-grow items-center gap-x-4 lg:gap-x-6'>
              {/* <ActiveDevelopmentBanner /> */}

              {/* BEGIN COMMENTING OUT SEARCH BAR */}

              {/* <form className='flex flex-1' action='#' method='GET'>
                <label htmlFor='search-field' className='sr-only'>
                  Search
                </label>
                <div className='relative w-full'>
                  <MagnifyingGlassIcon
                    className='pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500'
                    aria-hidden='true'
                  />
                  <input
                    id='search-field'
                    className='block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm'
                    placeholder='Search...'
                    type='search'
                    name='search'
                  />
                </div>
              </form> */}

              {/* END COMMENTING OUT SEARCH BAR */}
            </div>
            <div>
              {/* TODO -- Get Dark mode to work */}
              {/* <ModeToggle /> */}
            </div>
          </div>

          {/* START OF RHS CONTENT */}
          <div
            id='app-layout-rhs-content'
            className='mx-auto h-full overflow-y-auto max-w-screen-2xl flex flex-col px-2 lg:pl-2 lg:pr-4'
          >
            <main
              id='app-layout-react-router-Outlet'
              className='bg-gray-50 dark:bg-transparent h-full'
            >
              <Outlet />
            </main>
          </div>
          {/* END OF RHS CONTENT */}
        </div>
      </div>
    </>
  );
}
