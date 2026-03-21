const Assigned = require('../models/assigned_model');
const Project = require('../models/project_model');

function create(assignedData) {
    return Assigned.create(assignedData);
}

function findByProjectIdAndUserId(projectId, userId) {
    return Assigned.findOne({
        where: {
            project_id: projectId,
            user_id: userId
        }
    });
}

// Helper: Calculate project status based on start_date and end_date
const calculateProjectStatus = (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!start && !end) return 'not-started';
  if (start && now < start) return 'not-started';
  if (end && now > end) return 'finished';
  
  return 'ongoing';
};

async function findProjectsGroupedByStatus(userId, role) {
    // Step 1: Fetch all assigned records with projects
    const assignedRecords = await Assigned.findAll({
        where: {
            user_id: userId,
            role: role
        },
        include: [
            {
                model: Project,
                as: 'project',
                attributes: ['id', 'name', 'description', 'start_date', 'end_date']
            }
        ]
    });

    // Step 2: Initialize the 3 status groups
    const statusGroups = {
        'not-started': { status: 'not-started', count: 0, projects: [] },
        'ongoing':     { status: 'ongoing',     count: 0, projects: [] },
        'finished':    { status: 'finished',    count: 0, projects: [] }
    };

    // Step 3: Calculate status for each project and group them
    assignedRecords.forEach(record => {
        const project = record.get({ plain: true }).project;
        
        if (project) {
            // Calculate real-time status
            const status = calculateProjectStatus(project.start_date, project.end_date);
            
            // Add status to project object
            project.status = status;
            
            // Add to the appropriate group
            statusGroups[status].projects.push(project);
            statusGroups[status].count += 1;
        }
    });

    // Step 4: Sort ongoing projects by end_date (earliest first) ⚡
    statusGroups['ongoing'].projects.sort((a, b) => {
        // Handle null end_dates (put them at the end)
        if (!a.end_date && !b.end_date) return 0;
        if (!a.end_date) return 1;
        if (!b.end_date) return -1;
        
        // Sort by date ascending (earliest first)
        return new Date(a.end_date) - new Date(b.end_date);
    });

    // Step 5: Return as array of 3 records
    return Object.values(statusGroups);
}

module.exports = {
    create,
    findByProjectIdAndUserId,
    findProjectsGroupedByStatus
}