// ** Core JWT Import
import useJwt from '@src/@core/auth/jwt/useJwt'

// eslint-disable-next-line react-hooks/rules-of-hooks
const { jwt } = useJwt({})

export default jwt
