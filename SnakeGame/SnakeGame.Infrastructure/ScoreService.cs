using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SnakeGame.Infrastructure.Entities;

namespace SnakeGame.Infrastructure;

public class ScoreService
{
    ScoreContext _context;

    public ScoreService(ScoreContext context)
    {
        _context = context;
    }

    public async Task AddScore(string name, string gameMode, int score)
    {
        if(await _context.Scores.AnyAsync(s =>  s.Name == name && s.GameMode == gameMode && s.Value == score))
        {
            return;
        }

        await _context.Scores.AddAsync(new Score(){
            Name = name,
            GameMode = gameMode,
            Value = score,
            CreatedAt = DateTimeOffset.Now});

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Score>> GetTopScores(int amount)
    {
        return await _context.Scores.OrderByDescending(s => s.Value).Take(amount).ToArrayAsync();
    }
}
