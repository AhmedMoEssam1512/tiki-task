// backend/seeders/seedMassiveData.js
require('dotenv').config({ path: '../.env' });

const sequelize = require('../config/database');
const Project = require('../models/project_model');
const Assigned = require('../models/assigned_model');
const Task = require('../models/task_model');

// ============================================
// 🎲 Helper Functions
// ============================================

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomStatus = (weights = { pending: 0.7, 'in-progress': 0.2, finished: 0.1 }) => {
  const rand = Math.random();
  if (rand < weights.pending) return 'pending';
  if (rand < weights.pending + weights['in-progress']) return 'in-progress';
  return 'finished';
};

const randomTaskName = (projectName) => {
  const prefixes = ['Setup', 'Build', 'Design', 'Implement', 'Test', 'Deploy', 'Document', 'Review', 'Fix', 'Optimize'];
  const suffixes = ['module', 'feature', 'component', 'API', 'database', 'UI', 'tests', 'docs', 'config', 'integration'];
  return `${randomElement(prefixes)} ${projectName.split(' ')[0]} ${randomElement(suffixes)}`;
};

const randomDescription = () => {
  const descriptions = [
    'Initial implementation of the core functionality',
    'Add error handling and edge case coverage',
    'Write unit tests and integration tests',
    'Refactor code for better performance',
    'Update documentation and examples',
    'Fix bugs reported by QA team',
    'Optimize database queries and indexing',
    'Implement user feedback and improvements',
    'Prepare for production deployment',
    'Code review and quality assurance'
  ];
  return randomElement(descriptions);
};

// ============================================
// 📊 Configuration
// ============================================

const CONFIG = {
  users: [1, 2, 3, 4, 5, 6],
  projectCount: 30,
  tasksPerProject: { min: 5, max: 10 },
  membersPerProject: { min: 2, max: 5 },
  
  dateRanges: {
    finished: { start: new Date(2026, 0, 1), end: new Date(2026, 2, 15) },
    ongoing: { start: new Date(2026, 2, 1), end: new Date(2026, 5, 30) },
    notStarted: { start: new Date(2026, 5, 1), end: new Date(2026, 8, 30) }
  }
};

// Ratio: 60% pending (unassigned), 40% assigned (in-progress or finished)
const PENDING_RATIO = 0.6;

// ============================================
// 🏗️ Project Templates
// ============================================

const projectTemplates = [
  { name: 'Tiki Task Backend', desc: 'Node.js + PostgreSQL API development' },
  { name: 'Frontend React App', desc: 'React + Bootstrap user interface' },
  { name: 'Mobile App', desc: 'React Native cross-platform mobile app' },
  { name: 'API Documentation', desc: 'Swagger/OpenAPI documentation' },
  { name: 'Database Migration', desc: 'Legacy system data migration' },
  { name: 'Authentication System', desc: 'JWT + OAuth2 implementation' },
  { name: 'Payment Integration', desc: 'Stripe/PayPal payment gateway' },
  { name: 'Analytics Dashboard', desc: 'Real-time data visualization' },
  { name: 'Search Feature', desc: 'Elasticsearch integration' },
  { name: 'Notification System', desc: 'Email + push notifications' },
  { name: 'File Upload Service', desc: 'Cloud storage integration' },
  { name: 'User Management', desc: 'Admin panel for user operations' },
  { name: 'Testing Suite', desc: 'Unit + E2E test automation' },
  { name: 'CI/CD Pipeline', desc: 'GitHub Actions deployment workflow' },
  { name: 'Performance Optimization', desc: 'Caching + query optimization' },
  { name: 'Security Audit', desc: 'Vulnerability assessment and fixes' },
  { name: 'Localization', desc: 'Multi-language support implementation' },
  { name: 'Chat Feature', desc: 'WebSocket real-time messaging' },
  { name: 'Reporting Module', desc: 'PDF/Excel report generation' },
  { name: 'Backup System', desc: 'Automated database backups' },
  { name: 'Monitoring Setup', desc: 'Logging + alerting infrastructure' },
  { name: 'API Gateway', desc: 'Rate limiting + request routing' },
  { name: 'Cache Layer', desc: 'Redis implementation for performance' },
  { name: 'Email Service', desc: 'Transactional email templates' },
  { name: 'Social Login', desc: 'Google/Facebook/GitHub authentication' },
  { name: 'Data Export', desc: 'CSV/JSON data export functionality' },
  { name: 'Webhook System', desc: 'Third-party integration webhooks' },
  { name: 'Admin Dashboard', desc: 'Internal tools for operations team' },
  { name: 'Public API', desc: 'External developer API endpoints' },
  { name: 'Migration Scripts', desc: 'Database schema evolution scripts' }
];

// ============================================
// 🌱 Main Seed Function
// ============================================

const seedMassiveData = async () => {
  try {
    console.log('🚀 Starting MASSIVE seed for Tiki Task...');
    console.log(`📊 Configuration: ${CONFIG.projectCount} projects, ~${CONFIG.tasksPerProject.min * CONFIG.projectCount}-${CONFIG.tasksPerProject.max * CONFIG.projectCount} tasks`);
    console.log(`📋 Pending ratio: ${PENDING_RATIO * 100}% of tasks will be pending (unassigned)`);

    // Clear existing data (with CASCADE for foreign keys)
    console.log('\n🧹 Clearing existing data...');
    try {
      await Task.destroy({ where: {}, truncate: true, cascade: true });
      await Assigned.destroy({ where: {}, truncate: true, cascade: true });
      await Project.destroy({ where: {}, truncate: true, cascade: true });
      console.log('✅ Tables cleared');
    } catch (err) {
      console.log('⚠️  Using raw SQL fallback for truncation...');
      await sequelize.query('TRUNCATE TABLE tasks, assigned, projects RESTART IDENTITY CASCADE;');
      console.log('✅ Tables cleared via raw SQL');
    }

    // ============================================
    // 1. CREATE PROJECTS
    // ============================================
    console.log('\n📦 Creating projects...');
    const projects = [];
    
    for (let i = 0; i < CONFIG.projectCount; i++) {
      const rand = Math.random();
      let dateRange;
      if (rand < 0.3) {
        dateRange = CONFIG.dateRanges.finished;
      } else if (rand < 0.8) {
        dateRange = CONFIG.dateRanges.ongoing;
      } else {
        dateRange = CONFIG.dateRanges.notStarted;
      }
      
      const template = projectTemplates[i % projectTemplates.length];
      const owner = randomElement(CONFIG.users);
      
      const startDate = randomDate(dateRange.start, dateRange.end);
      const durationDays = Math.floor(Math.random() * 30) + 7;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);
      
      projects.push({
        name: `${template.name} #${Math.floor(i/3) + 1}`,
        description: `${template.desc} - Sprint ${Math.floor(i/3) + 1}`,
        owner_id: owner,
        start_date: startDate,
        end_date: endDate
      });
    }
    
    const createdProjects = await Project.bulkCreate(projects, { individualHooks: false });
    console.log(`✅ Created ${createdProjects.length} projects`);

    // ============================================
    // 2. CREATE ASSIGNMENTS
    // CONSTRAINT 2: Only 1 admin per project (the owner)
    // ============================================
    console.log('\n👥 Creating assignments (1 admin per project)...');
    const assignments = [];
    
    for (const project of createdProjects) {
      // ✅ CONSTRAINT 2: Owner is the ONLY admin
      assignments.push({
        project_id: project.id,
        user_id: project.owner_id,
        role: 'admin'
      });
      
      // Add random members (some as 'member', some as 'pending')
      const memberCount = Math.floor(
        Math.random() * (CONFIG.membersPerProject.max - CONFIG.membersPerProject.min + 1)
      ) + CONFIG.membersPerProject.min;
      
      const availableUsers = CONFIG.users.filter(u => u !== project.owner_id);
      const selectedMembers = availableUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(memberCount, availableUsers.length));
      
      for (const userId of selectedMembers) {
        // 80% member, 20% pending
        const role = Math.random() < 0.8 ? 'member' : 'pending';
        
        assignments.push({
          project_id: project.id,
          user_id: userId,
          role: role
        });
      }
    }
    
    const createdAssignments = await Assigned.bulkCreate(assignments, { 
      individualHooks: false,
      ignoreDuplicates: true 
    });
    console.log(`✅ Created ${createdAssignments.length} assignments`);
    
    // Verify constraint 2
    const adminCounts = {};
    for (const assignment of assignments) {
      if (assignment.role === 'admin') {
        adminCounts[assignment.project_id] = (adminCounts[assignment.project_id] || 0) + 1;
      }
    }
    
    const projectsWithMultipleAdmins = Object.entries(adminCounts)
      .filter(([_, count]) => count > 1);
    
    if (projectsWithMultipleAdmins.length > 0) {
      console.error('❌ ERROR: Some projects have multiple admins:', projectsWithMultipleAdmins);
      throw new Error('Constraint 2 violated: Multiple admins per project');
    } else {
      console.log('✅ Verified Constraint 2: Each project has exactly 1 admin');
    }

    // ============================================
    // 3. CREATE TASKS
    // CONSTRAINT 1: Task assigned_to must be in project (or NULL for pending)
    // CONSTRAINT 3: 'pending' users can't have tasks
    // CONSTRAINT 4: Task due_date within project timeline
    // CONSTRAINT 5: 'in-progress' tasks MUST be assigned
    // CONSTRAINT 6: 'pending' tasks MUST be unassigned
    // CONSTRAINT 7: 'finished' tasks MUST be assigned
    // ============================================
    console.log('\n✅ Creating tasks...');
    const tasks = [];
    
    for (const project of createdProjects) {
      const taskCount = Math.floor(
        Math.random() * (CONFIG.tasksPerProject.max - CONFIG.tasksPerProject.min + 1)
      ) + CONFIG.tasksPerProject.min;
      
      // ✅ Get eligible users (NOT pending)
      const projectAssignments = assignments.filter(
        a => a.project_id === project.id && a.role !== 'pending'
      );
      const assignedUsers = projectAssignments.map(a => a.user_id);
      
      for (let j = 0; j < taskCount; j++) {
        // ✅ STATUS ↔ assigned_to RULES:
        // | Status        | assigned_to     |
        // |---------------|-----------------|
        // | 'pending'     | MUST be NULL    |
        // | 'in-progress' | MUST NOT be NULL|
        // | 'finished'    | MUST NOT be NULL|
        
        let status, assignedTo;
        
        // Decide if this task will be pending (unassigned) or active (assigned)
        const willBePending = Math.random() < PENDING_RATIO;
        
        if (willBePending) {
          // ✅ PENDING task → MUST be unassigned
          status = 'pending';
          assignedTo = null;
        } else if (assignedUsers.length > 0) {
          // ✅ ASSIGNED task → MUST be in-progress or finished (NOT pending)
          assignedTo = randomElement(assignedUsers);
          // 70% in-progress, 30% finished
          status = Math.random() < 0.7 ? 'in-progress' : 'finished';
        } else {
          // Fallback: no eligible users → make it pending
          status = 'pending';
          assignedTo = null;
        }
        
        // ✅ CONSTRAINT 4: due_date within project timeline
        const projectStart = new Date(project.start_date);
        const projectEnd = new Date(project.end_date);
        const now = new Date();
        
        const minDueDate = new Date(Math.max(projectStart, now));
        const maxDueDate = projectEnd;
        
        let dueDate;
        if (minDueDate < maxDueDate) {
          dueDate = randomDate(minDueDate, maxDueDate);
        } else {
          dueDate = projectEnd;
        }
        
        tasks.push({
          name: randomTaskName(project.name),
          description: randomDescription(),
          status: status,
          due_date: dueDate,
          project_id: project.id,
          assigned_to: assignedTo
        });
      }
    }
    
    const createdTasks = await Task.bulkCreate(tasks, { 
      individualHooks: false,
      ignoreDuplicates: false 
    });
    console.log(`✅ Created ${createdTasks.length} tasks`);
    
    // Count breakdown
    const pendingCount = createdTasks.filter(t => t.status === 'pending').length;
    const inProgressCount = createdTasks.filter(t => t.status === 'in-progress').length;
    const finishedCount = createdTasks.filter(t => t.status === 'finished').length;
    
    const pendingUnassigned = createdTasks.filter(t => t.status === 'pending' && t.assigned_to === null).length;
    const inProgressAssigned = createdTasks.filter(t => t.status === 'in-progress' && t.assigned_to !== null).length;
    const finishedAssigned = createdTasks.filter(t => t.status === 'finished' && t.assigned_to !== null).length;

    console.log(`   Pending tasks: ${pendingCount} (all unassigned: ${pendingUnassigned === pendingCount ? '✅' : '❌'})`);
    console.log(`   In-progress tasks: ${inProgressCount} (all assigned: ${inProgressAssigned === inProgressCount ? '✅' : '❌'})`);
    console.log(`   Finished tasks: ${finishedCount} (all assigned: ${finishedAssigned === finishedCount ? '✅' : '❌'})`);

    // ============================================
    // 📈 Summary Statistics & Constraint Verification
    // ============================================
    console.log('\n📊 Seed Summary:');
    console.log(`   Projects: ${createdProjects.length}`);
    console.log(`   Assignments: ${createdAssignments.length}`);
    console.log(`   Tasks: ${createdTasks.length}`);
    
    // Task status breakdown
    const statusCounts = {};
    for (const task of createdTasks) {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    }
    console.log(`   Task Status: ${JSON.stringify(statusCounts)}`);
    
    // Role breakdown
    const roleCounts = {};
    for (const assignment of assignments) {
      roleCounts[assignment.role] = (roleCounts[assignment.role] || 0) + 1;
    }
    console.log(`   Admins: ${roleCounts.admin || 0} (1 per project)`);
    console.log(`   Members: ${roleCounts.member || 0}`);
    console.log(`   Pending: ${roleCounts.pending || 0}`);
    
    // ✅ CONSTRAINT VERIFICATIONS
    console.log('\n🔍 Verifying Constraints...');
    
    // Constraint 1: All assigned tasks go to project members (not pending)
    const assignedTasks = createdTasks.filter(t => t.assigned_to !== null);
    let constraint1Violations = 0;
    for (const task of assignedTasks) {
      const isEligibleMember = assignments.some(
        a => a.project_id === task.project_id && 
             a.user_id === task.assigned_to && 
             a.role !== 'pending'
      );
      if (!isEligibleMember) {
        constraint1Violations++;
      }
    }
    if (constraint1Violations === 0) {
      console.log('✅ Constraint 1: All assigned tasks go to eligible members');
    } else {
      console.error(`❌ Constraint 1: ${constraint1Violations} violations`);
    }
    
    // Constraint 3: No pending users have tasks
    const pendingAssignments = assignments.filter(a => a.role === 'pending');
    const pendingUsersWithTasks = pendingAssignments.filter(pending =>
      createdTasks.some(t => t.project_id === pending.project_id && t.assigned_to === pending.user_id)
    );
    if (pendingUsersWithTasks.length === 0) {
      console.log('✅ Constraint 3: No pending users have tasks');
    } else {
      console.error(`❌ Constraint 3: ${pendingUsersWithTasks.length} pending users have tasks`);
    }
    
    // Constraint 4: All task due_dates within project timeline
    let constraint4Violations = 0;
    for (const task of createdTasks) {
      const project = createdProjects.find(p => p.id === task.project_id);
      const taskDueDate = new Date(task.due_date);
      const projectStart = new Date(project.start_date);
      const projectEnd = new Date(project.end_date);
      if (taskDueDate < projectStart || taskDueDate > projectEnd) {
        constraint4Violations++;
      }
    }
    if (constraint4Violations === 0) {
      console.log('✅ Constraint 4: All task due_dates within project timeline');
    } else {
      console.error(`❌ Constraint 4: ${constraint4Violations} violations`);
    }
    
    // Constraint 5: All in-progress tasks are assigned
    const inProgressUnassigned = createdTasks.filter(
      t => t.status === 'in-progress' && t.assigned_to === null
    );
    if (inProgressUnassigned.length === 0) {
      console.log('✅ Constraint 5: All in-progress tasks are assigned');
    } else {
      console.error(`❌ Constraint 5: ${inProgressUnassigned.length} in-progress tasks are unassigned!`);
    }
    
    // Constraint 6: All pending tasks are unassigned
    const pendingAssigned = createdTasks.filter(
      t => t.status === 'pending' && t.assigned_to !== null
    );
    if (pendingAssigned.length === 0) {
      console.log('✅ Constraint 6: All pending tasks are unassigned');
    } else {
      console.error(`❌ Constraint 6: ${pendingAssigned.length} pending tasks are assigned!`);
    }
    
    // Constraint 7: All finished tasks are assigned
    const finishedUnassigned = createdTasks.filter(
      t => t.status === 'finished' && t.assigned_to === null
    );
    if (finishedUnassigned.length === 0) {
      console.log('✅ Constraint 7: All finished tasks are assigned');
    } else {
      console.error(`❌ Constraint 7: ${finishedUnassigned.length} finished tasks are unassigned!`);
    }

    console.log('\n🎉 MASSIVE seed completed successfully!');
    console.log('💡 Tip: Test your dashboard with different user tokens!');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  seedMassiveData()
    .then(() => {
      console.log('\n✅ Process exiting...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Fatal error:', err);
      process.exit(1);
    });
}

module.exports = seedMassiveData;