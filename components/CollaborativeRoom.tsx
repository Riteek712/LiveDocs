'use client'
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import React, { useEffect, useRef, useState } from 'react'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from './Loader'


const CollaborativeRoom = ({ roomId, roomMetadata }: CollaborativeRoomProps) => {
  const currentUserType = "Editor"
  const [editing, setEditing] = useState(false)
  const [docTitle, setDocTitle] = useState(roomMetadata.title)
  const [loading, setloading] = useState(false)


  const containsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') {
      setloading(true)
      try {
        if (docTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, docTitle)

          if (updatedDocument) {
            setEditing(false)
          }
        }
      } catch (error) {
        console.error(error)
      }

      setloading(false)
    }
  }
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containsRef.current && !containsRef.current.contains(e.target as Node)) {
        setEditing(false)
        updateDocument(roomId, docTitle)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roomId, docTitle])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader/>}>
        <div className='collaborative-room'>
          <Header>
            <div ref={containsRef} className='flex w-fit items-center justify-cneter gap-2'>
              {editing && !loading ? (
                <Input
                  type="text"
                  value={docTitle}
                  ref={inputRef}
                  placeholder='Enter title'
                  onChange={(e) => setDocTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disable={!editing}
                  className='document-title-input'
                />
              ) : (
                <>
                  <p className='document-title'>{docTitle}</p>
                </>
              )}
              {currentUserType === "Editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt='edit'
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className='pointer'
                />

              )}

              {currentUserType !== "Editor" && !editing && (
                <p className='view-only-tag'>View only</p>
              )}
              {loading && <p className="test-sm text-grey-400">saving...</p>}
            </div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Header>
          <Editor />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom