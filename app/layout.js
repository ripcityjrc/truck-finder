import './globals.css'

export const metadata = {
  title: 'Toyota Tundra Finder',
  description: 'Search Toyota Tundra inventory in Phoenix, AZ area',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
