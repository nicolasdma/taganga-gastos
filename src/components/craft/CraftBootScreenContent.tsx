import { CraftScreenMessage } from '@/components/craft/CraftScreenMessage'

interface CraftBootScreenContentProps {
  message?: string
  kittyLive?: boolean
}

export function CraftBootScreenContent({
  message = '🐾 un momentito',
  kittyLive = true,
}: CraftBootScreenContentProps) {
  return (
    <>
      <div className="boot-screen__paws" aria-hidden />
      <div className="boot-screen__kitty-float" aria-hidden>
        <div className="boot-screen__kitty-wrap">
          <div
            className={
              kittyLive ? 'boot-screen__kitty boot-screen__kitty--live' : 'boot-screen__kitty'
            }
          />
        </div>
      </div>
      <CraftScreenMessage text={message} />
    </>
  )
}
