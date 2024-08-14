using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using SnakeApp.Model;
using SnakeGame.Infrastructure;
using SnakeGame.Infrastructure.Entities;

namespace SnakeApp.Pages
{
    public class IndexModel : PageModel
    {
        readonly ILogger<IndexModel> _logger;

        readonly ScoreService _scoreService;

        public IEnumerable<Score> TopScores;

        public readonly GamemodeOptions Gamemodes;

        public IndexModel(ILogger<IndexModel> logger, IOptionsSnapshot<GamemodeOptions> gamemodeOptions, ScoreService scoreService)
        {
            _logger = logger;
            _scoreService = scoreService;
            Gamemodes = gamemodeOptions.Value;
        }

        public async Task OnGet()
        {
            TopScores = await _scoreService.GetTopScores(20);
        }
    }
}
