using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
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
        var current = new Score()
        {
            Name = name,
            GameMode = gameMode,
            Value = score,
            CreatedAt = DateTimeOffset.Now
        };

        var previous = await _context.Scores.FirstOrDefaultAsync(s => s.Name == name && s.GameMode == gameMode);

        if(previous is not null)
        {
            if (score <= previous.Value)
            {
                return;
            }

            _context.Scores.Remove(previous);
            AddToDb(current);
        }
        else
        {
            await AddToDb(current);
        }

    }

    private async Task AddToDb(Score score)
    {
        _context.Scores.Add(score);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Score>> GetTopScores(int amount)
    {
        return await _context.Scores.OrderByDescending(s => s.Value).Take(amount).ToArrayAsync();
    }
}
