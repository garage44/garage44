import {UsersForm} from '@garage44/common/components'
import {$t} from '@garage44/common/app'

interface UsersFormWrapperProps {
    userId?: string
}

export default function UsersFormWrapper({userId}: UsersFormWrapperProps) {
    return <UsersForm $t={$t} userId={userId} />
}
