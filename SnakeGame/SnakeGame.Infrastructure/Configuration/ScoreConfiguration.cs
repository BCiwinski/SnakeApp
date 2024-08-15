using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Logging;
using SnakeGame.Infrastructure.Entities;
using System.ComponentModel;
namespace SnakeGame.Infrastructure.Configuration;

internal static class ScoreConfiguration
{
    public static void Configure(EntityTypeBuilder<Score> builder)
    {
        ValueConverter<DateTimeOffset, long> dateTimeOffsetConverter = new(
            d => d.ToUnixTimeSeconds(),
            l => DateTimeOffset.FromUnixTimeSeconds(l));

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id).HasColumnType("INTEGER").IsRequired();
        builder.Property(s => s.Name).HasColumnType("TEXT").IsRequired();
        builder.Property(s => s.Value).HasColumnType("INTEGER").IsRequired();
        builder.Property(s => s.GameMode).HasColumnType("TEXT").IsRequired();

        builder.Property(s => s.CreatedAt)
            .HasConversion(dateTimeOffsetConverter)
            .HasColumnType("INTEGER")
            .ValueGeneratedOnAdd()
            .IsRequired();
    }
}
