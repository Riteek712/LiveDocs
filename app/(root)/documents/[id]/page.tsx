import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";


const Document = async ({params: {id}}: SearchParamProps) => {
  const clerkUser = await currentUser();
  if(!clerkUser) redirect('/sign-in')

  const room  = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  })

  if(!room) redirect('/');

  // TODO: Assess the permissions of the user to access the document.
  const userIds = Object.keys(room.usersAccesses)
  console.log("userIds")
  console.log(userIds)
  const users = await getClerkUsers({userIds});
  const usersData = users.map((user: User) => ({
    ...user,
    
    userType: (room.usersAccesses[user.email]?.includes('room:write'))
      ? 'editor'
      : 'viewer'
  }))

const emailToCheck = clerkUser.emailAddresses[0]?.emailAddress;
const requiredPermission = 'room:write';

// Check if the email exists in userAccesses and has the 'room:write' permission
const hasPermission = room.usersAccesses[emailToCheck] && room.usersAccesses[emailToCheck].includes(requiredPermission);
console.log(hasPermission);
  const currentUserType = hasPermission ? 'editor' : 'viewer';

  return (
    <main className="flex w-ful flex-col items-center">
      <CollaborativeRoom 
      roomId={id}
      roomMetadata={room.metadata}
      users={usersData}
      currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document