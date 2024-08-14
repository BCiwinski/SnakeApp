using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SnakeGame.Infrastructure.Configuration;
using SnakeGame.Infrastructure.Entities;

namespace SnakeGame.Infrastructure;

public class ScoreContext : DbContext
{
    public DbSet<Score> Scores {  get; set; }

    public string ConnectionString { get; }

    private readonly IConfiguration _configuration;

    public ScoreContext(IConfiguration configuration)
    {
        _configuration = configuration;

        ConnectionString = _configuration.GetConnectionString("ScoreDb");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite(ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ScoreConfiguration.Configure(modelBuilder.Entity<Score>());
    }
}

