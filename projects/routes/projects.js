var express = require('express');
var router = express.Router();
const Project = require('../model/project');
const Joi = require('joi');
const methodOverride = require('method-override');

router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

/* GET projects listing. */
router.get('/', function(req, res, next) {
    Project.find({}, function(err, projects) {
        if (err) {
            return console.error(err);
        } else {
            res.format({
                html: function() {
                    res.render('projects/index', {
                        title: 'Welcome to project maker - LV 6',
                        "projects": projects
                    });
                },
                json: function() {
                    res.json(projects);
                }
            });
        }
    })
});


router.get('/add', function(req, res) {
    res.render('projects/add', { title: 'Add New Project' });
});

/* GET project by id. */
router.get('/:id', function(req, res, next) {
    const id = req.params.id;
    if (id == null || id.length != 24) {
        return res.status(400).send('Invalid project ID');
    }
    Project.findById(id, function(err, project) {
        if (err) {
            res.render('/projects');
        } else {
            res.format({
                html: function() {
                    res.render("projects/show", {
                        title: 'Show Project',
                        "project": project
                    });
                },
                json: function() {
                    res.json(project);
                }
            });
        }
    });
})

const projectSerializer = Joi.object({
    project_name: Joi.string().required(),
    project_description: Joi.string().required(),
    jobs_done: Joi.string().required(),
    project_price: Joi.number().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    members: Joi.array().items(Joi.string()),
});

/* POST project. */
router.post('/create', function(req, res, next) {
    var parsedMembers = JSON.parse(req.body['members[]']);
    delete req.body['members[]'];
    req.body.members = parsedMembers;
    const result = projectSerializer.validate(req.body);
    if (result.error) {
        return res.status(400).send(result.error);
    }

    Project.create({
        naziv_projekta: result.value.project_name,
        opis_projekta: result.value.project_description,
        obavljeni_poslovi: result.value.jobs_done,
        cijena_projekta: result.value.project_price,
        datum_pocetka: result.value.start_date,
        datum_zavrsetka: result.value.end_date,
        clanovi: result.value.members
    }, function(err, project) {
        if (err) {
            res.send("There was a problem with adding the project.");
        } else {
            res.format({
                html: function() {
                    res.location("projects");
                    res.redirect("/projects");
                }
            });
        }
    })
})

/* Get project for EDIT. */
router.get('/edit/:id', function(req, res, next) {
    const id = req.params.id;
    if (id == null || id.length != 24) {
        return res.status(400).send('Invalid project ID');
    }
    Project.findById(id, function(err, project) {
        if (err) {
            res.render('/projects');
        } else {
            var datum_pocetka = project.datum_pocetka.toISOString();
            var datum_zavrsetka = project.datum_zavrsetka.toISOString();

            datum_pocetka = datum_pocetka.substring(0, datum_pocetka.indexOf('T'))
            datum_zavrsetka = datum_zavrsetka.substring(0, datum_zavrsetka.indexOf('T'))

            res.format({
                html: function() {
                    res.render("projects/edit", {
                        title: 'Edit Project',
                        "project": project,
                        "datum_pocetka": datum_pocetka,
                        "datum_zavrsetka": datum_zavrsetka
                    });
                },
                json: function() {
                    res.json(project);
                }
            });
        }
    });
})

/* Update project. */
router.put('/update/:id', function(req, res, next) {
        var parsedMembers = JSON.parse(req.body['members[]']);
        delete req.body['members[]'];
        req.body.members = parsedMembers;

        const result = projectSerializer.validate(req.body);
        if (result.error) {
            return res.status(400).send(result.error);
        }
        const id = req.params.id;
        if (id == null || id.length != 24) {
            return res.status(400).send('Invalid project ID');
        }
        Project.findById(id, function(err, project) {
            project.update({
                naziv_projekta: result.value.project_name,
                opis_projekta: result.value.project_description,
                obavljeni_poslovi: result.value.jobs_done,
                cijena_projekta: result.value.project_price,
                datum_pocetka: result.value.start_date,
                datum_zavrsetka: result.value.end_date,
                clanovi: result.value.members
            }, function(err, project) {
                if (err) {
                    res.send("There was a problem with updating a project.");
                } else {
                    res.format({
                        html: function() {
                            res.location("projects");
                            res.redirect("/projects");
                        }
                    });
                }
            })
        });
    })
    /* DELETE project. */
router.delete('/delete/:id', function(req, res, next) {
    Project.findById(req.params.id, function(err, project) {
        if (err) {
            res.render('/projects');
            console.error(err);
        } else {
            project.remove(function(err, project) {
                if (err) {
                    res.render('/projects');
                    console.error(err);
                } else {
                    res.format({
                        html: function() {
                            res.location("projects");
                            res.redirect("/projects");
                        }
                    });
                }
            });
        }
    });
})

module.exports = router;