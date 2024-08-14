using Microsoft.EntityFrameworkCore;
using SnakeApp.Model;
using SnakeGame.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();


builder.Services.Configure<GamemodeOptions>(builder.Configuration.GetSection("Gamemodes"));
builder.Services.AddTransient<ScoreContext>();
builder.Services.AddTransient<ScoreService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.Services.GetService<ScoreContext>().Database.Migrate();

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.MapControllers();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
