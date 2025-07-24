import { userProfiles } from '../data/userProfiles';

// Simple similarity function for k-NN style matching
function similarity(a, b) {
  let score = 0;
  if (a.userType === b.userType) score += 3;
  if (a.comfort === b.comfort) score += 2;
  if (a.goals && b.goals && a.goals.toLowerCase().split(' ').some(word => b.goals.toLowerCase().includes(word))) score += 1;
  // Savings, income, expenses: closer values get higher score
  score -= Math.abs((a.savings || 0) - (b.savings || 0)) / 1000;
  score -= Math.abs((a.income || 0) - (b.income || 0)) / 2000;
  score -= Math.abs((a.expenses || 0) - (b.expenses || 0)) / 2000;
  return score;
}

// Generate recommendations based on similar users
export function getRecommendationsForUser(userProfile, k = 3) {
  // Find k most similar users (excluding the current user if present)
  const others = userProfiles.filter(u => u.displayName !== userProfile.displayName);
  const scored = others.map(u => ({ user: u, score: similarity(userProfile, u) }));
  scored.sort((a, b) => b.score - a.score);
  const neighbors = scored.slice(0, k).map(s => s.user);

  // Aggregate recommendations from neighbors
  const recs = [];
  neighbors.forEach(neighbor => {
    // Example recommendations based on neighbor's goals and financials
    if (neighbor.savings < 1000) {
      recs.push('Consider starting a savings goal to build an emergency fund.');
    }
    if (neighbor.goals && neighbor.goals.toLowerCase().includes('expand')) {
      recs.push('Explore small business loans or investment plans to expand.');
    }
    if (neighbor.comfort === 'beginner') {
      recs.push('Check out our beginner’s guide to money management.');
    }
    if (neighbor.income > neighbor.expenses + 500) {
      recs.push('You may want to invest your surplus income for future growth.');
    }
    if (neighbor.goals && neighbor.goals.toLowerCase().includes('travel')) {
      recs.push('Open a recurring deposit to save for your travel plans.');
    }
    if (neighbor.userType === 'shg') {
      recs.push('Invite group members to join and track group savings together.');
    }
    if (neighbor.userType === 'farmer' && neighbor.goals.toLowerCase().includes('irrigation')) {
      recs.push('Check out our special loans for farm equipment and irrigation.');
    }
    if (neighbor.userType === 'artisan' && neighbor.goals.toLowerCase().includes('tools')) {
      recs.push('Apply for a micro-loan to upgrade your tools.');
    }
  });

  // Remove duplicates and limit to 5 recommendations
  return [...new Set(recs)].slice(0, 5);
} 