const _ = require('lodash')
const {Path} = require('path-parser')
const { URL } = require('url')
const mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const requireCredits = require('../middlewares/requireCredits')
const Mailer = require('../services/Mailer')
const surveyTemplate = require('../services/emailTemplates/surveyTemplate')

const Survey = mongoose.model('surveys')

module.exports = (app) => {

    app.get('/api/surveys',requireLogin, async(req, res) => {
        const surveys = await Survey.find({ _user: req.user.id }).select({recipients: false})
        res.send(surveys)
    })

    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thanks for sending feedback!')
    })

    app.post('/api/surveys/webhooks', (req, res) => {
        const p = new Path('/api/surveys/:surveyId/:choice')
        //lodash chain helper
        _.chain(req.body)                                        
        .map((event) => {
            const pathname = new URL(event.url).pathname
            const match = p.test(pathname)

            if(match) {
                return {
                    email: event.email,
                    surveyId: match.surveyId,
                    choice: match.choice
                } 
            }
        })      
        .compact() //removes undefined
        .uniqBy('email', 'surveyId') // unique objects from email and surveyId keys
        .each(({ surveyId, email, choice }) => {
            Survey.updateOne({  //finding the survey with id
                _id: surveyId,
                recipients: {
                    $elemMatch: { email: email, responded: false }  // trying to match it with email using $elemMatch
                }
            }, {
                $inc: { [choice]: 1 },      //$inc for incrementing
                $set: { 'recipients.$.responded': true}, //$set for setting new value
                lastResponded: new Date()
            }).exec()
        })
        .value()

        res.send({})
    })

    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
        const { title, subject, body, recipients } = req.body

        const survey = new Survey({
            title: title,
            subject: subject,
            body: body,
            recipients: recipients.split(',').map(email => ({ email: email.trim() })),   //recipients: recipients.split(',').map(email => { return { email: email }}) 
            _user: req.user.id,
            dateSent: Date.now() 
        })

        //Before saving newly created survey we need to 1st send email to all recipients then 
        //if successfull then we can save survey to mongoDB
        const mailer = new Mailer(survey, surveyTemplate(survey))
       
        try {
            await mailer.send()

            //Finally saving after response from sendgrid
            await survey.save()
    
            //We are charging credit here
            req.user.credits -= 1
            const user = await req.user.save()
    
            res.send(user)
        } catch (err) {
            res.status(422)
        }
    })
}