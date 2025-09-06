// 'use client';

import Image from 'next/image';
import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import { FaBars, FaGithub } from 'react-icons/fa6';
import { Container } from './Container';

export function Navigation() {
  // const pathname = usePathname();

  return (
    <Container
      as='nav'
      px
      py
      className='flex flex-row items-center justify-between text-black bg-white md:bg-transparent md:text-white'
    >
      <Link
        href='/'
      >
        <Image
          src='/quabos.png'
          width='36'
          height='36'
          alt='quabos logo'
          className='rounded-full hover:scale-105 transition duration-200 ease-in-out'
        />
      </Link>

      <div className='hidden md:flex md:gap-x-12 md:gap-y-0 gap-5 items-center text-lg'>
        <Link href='/docs'>Docs</Link>
        <Link href='/privacy-policy'>Privacy Policy</Link>
        <a
          href='https://github.com/ohmrr/quabos-discord'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='GitHub repository'
        >
          <FaGithub size='32' />
        </a>
      </div>

      <button className='md:hidden text-2xl'>
        <FaBars />
      </button>
    </Container>
  );
}
