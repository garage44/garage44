import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {config} from '../lib/config.ts'
import {logger} from '../service.ts'

export default async function(app) {

    app.get('/api/context', async function(req, res) {
        let context

        if (process.env.GARAGE44_NO_SECURITY) {
            logger.warn('session security is disabled (GARAGE44_NO_SECURITY)')
            context = adminContext()
            return res.end(JSON.stringify(context))
        }

        const session=req.session

        if (session.userid) {
            const user = config.users.find((i) => i.name === session.userid)
            if (!user) {
                context = deniedContext()
            } else {
                if (adminContext) {
                    context = adminContext()
                } else {
                    context = userContext()
                }
            }
        } else {
            context = deniedContext()
        }
        res.end(JSON.stringify(context))
    })

    app.post('/api/login', async(req, res) => {
        const users = config.users
        const username = req.body.username
        let context
        const user = users.find((i) => i.name === username)
        if (!user) {
            context = deniedContext()
        } else {
            const password = req.body.password
            if (password === user.password) {
                const session = req.session
                session.userid = user.name
                if (user.admin) {
                    context = adminContext()
                } else {
                    context = userContext()
                }
            } else {
                context = deniedContext()
            }
        }
        res.end(JSON.stringify(context))
    })

    app.get('/api/logout',async(req, res) => {
        req.session.destroy()
        const context = deniedContext()
        res.end(JSON.stringify(context))
    })
}
