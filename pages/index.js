import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next-Blog</title>
        <meta name="description" content="My first project with next.js and tailwind" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-3xl font-bold underline hover:text-amber-500 transition">
          Namaste Blog !
        </h1>
        <p className="font-bold">
          First <span className="text-green-500">Tailwind</span> + <span className="text-blue-500">Next</span> app
        </p>
      </main>
    </div>
  )
}
